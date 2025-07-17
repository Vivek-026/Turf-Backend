const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    court: [{ type: String, required: true }],
    sport: { type: String, required: true },
    date: { type: Date, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },     // Start time (e.g., "15:00")
    endTime: { type: String, required: true },  // End time (e.g., "18:00")
    hours: { type: Number, required: true },
    pricePaid: { type: Number, required: true },
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'expired'],
      default: 'booked',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunding', 'refunded', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
