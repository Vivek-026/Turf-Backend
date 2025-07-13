const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const Turf = require('../models/turfModel');
const { BadRequest, Forbidden, NotFound } = require('http-errors');

const {
  isBefore, addDays, getDay,
  setHours, setMinutes, setSeconds, setMilliseconds
} = require('date-fns');

// Helper to check slot availability
async function isSlotAvailable(turf, day, time) {
  const dayObj = turf.availableSlots.find(d => d.day.toLowerCase() === day.toLowerCase());
  if (!dayObj) return false;
  const slot = dayObj.slots.find(s => s.time === time);
  return slot && !slot.isBooked;
}

// Helper to update slot status
async function updateSlotStatus(turfId, day, time, isBooked) {
  return Turf.updateOne(
    { _id: turfId, 'availableSlots.day': day, 'availableSlots.slots.time': time },
    { $set: { 'availableSlots.$[d].slots.$[s].isBooked': isBooked } },
    {
      arrayFilters: [
        { 'd.day': day },
        { 's.time': time }
      ]
    }
  );
}

// Helper to get slot price
function getSlotPrice(turf, day, time) {
  const dayObj = turf.availableSlots.find(d => d.day.toLowerCase() === day.toLowerCase());
  if (!dayObj) return null;
  const slot = dayObj.slots.find(s => s.time === time);
  return slot ? slot.price : null;
}

// Helper to check if slot is in the past
function isPastSlot(day, time) {
  const now = new Date();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDayIdx = daysOfWeek.indexOf(day.toLowerCase());
  if (targetDayIdx === -1) return true;

  const [hour, minute] = time.split('-')[0].split(':');
  let daysUntilSlot = (targetDayIdx - getDay(now) + 7) % 7;

  let slotDate = addDays(now, daysUntilSlot);
  slotDate = setHours(slotDate, Number(hour));
  slotDate = setMinutes(slotDate, Number(minute));
  slotDate = setSeconds(slotDate, 0);
  slotDate = setMilliseconds(slotDate, 0);

  if (daysUntilSlot === 0 && isBefore(slotDate, now)) {
    slotDate = addDays(slotDate, 7);
  }

  return isBefore(slotDate, now);
}

// Book Slot
exports.bookSlot = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { turfId } = req.params;
    const { day, time } = req.body;

    if (!day || !time) throw new BadRequest('Day and time are required');

    const turf = await Turf.findById(turfId);
    if (!turf) throw new NotFound('Turf not found');

    if (!await isSlotAvailable(turf, day, time)) throw new BadRequest('Slot not available or already booked');
    if (isPastSlot(day, time)) throw new BadRequest('Cannot book a past slot');

    const existing = await Booking.findOne({ turf: turfId, day, time, status: 'booked' });
    if (existing) throw new BadRequest('Slot already booked');

    const price = getSlotPrice(turf, day, time);
    if (price == null) throw new BadRequest('Slot price not found');

    await updateSlotStatus(turfId, day, time, true);

    const booking = await Booking.create({
      user: userId,
      turf: turfId,
      day,
      time,
      pricePaid: price,
      paymentStatus: 'pending',
      status: 'booked'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('turf', 'name');

    res.status(201).json(populatedBooking);
  } catch (err) {
    next(err);
  }
};

// Expire past bookings and reset slots
exports.expirePastBookingsAndResetSlots = async () => {
  const now = new Date();
  const bookings = await Booking.find({ status: 'booked' });
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  for (const booking of bookings) {
    const targetDayIdx = daysOfWeek.indexOf(booking.day.toLowerCase());
    const [hour, minute] = booking.time.split('-')[0].split(':');
    let createdAt = new Date(booking.createdAt);
    let daysUntilSlot = (targetDayIdx - getDay(createdAt) + 7) % 7;

    let slotDate = addDays(createdAt, daysUntilSlot);
    slotDate = setHours(slotDate, Number(hour));
    slotDate = setMinutes(slotDate, Number(minute));
    slotDate = setSeconds(slotDate, 0);
    slotDate = setMilliseconds(slotDate, 0);

    if (isBefore(slotDate, now)) {
      booking.status = 'expired';
      await booking.save();
      await updateSlotStatus(booking.turf, booking.day, booking.time, false);
    }
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('turf', 'name');

    if (!booking) throw new NotFound('Booking not found');

    const userId = mongoose.Types.ObjectId.isValid(req.userId)
      ? req.userId
      : new mongoose.Types.ObjectId(req.userId);

    if (booking.user._id.toString() !== userId.toString() && req.userRole !== 'admin' && req.userRole !== 'owner') {
      throw new Forbidden('Not allowed to cancel this booking');
    }

    if (booking.status === 'cancelled') throw new BadRequest('Booking already cancelled');

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunding'; // Add payment gateway logic here
    }

    await booking.save();
    await updateSlotStatus(booking.turf._id, booking.day, booking.time, false);

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('user', 'name email')
      .populate('turf', 'name');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// Admin/Owner: Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    if (req.userRole !== 'owner' && req.userRole !== 'admin') throw new Forbidden('Not allowed');

    const filter = {};
    if (req.query.turf) filter.turf = req.query.turf;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.day) filter.day = req.query.day;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('turf', 'name')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
