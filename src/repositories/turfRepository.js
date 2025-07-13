const Turf = require('../models/turfModel');

class TurfRepository {
    async create(turfData) {
        try {
            const turf = new Turf(turfData);
            return await turf.save();
        } catch (error) {
            throw error;
        }
    }

    async findById(turfId) {
        try {
            return await Turf.findById(turfId)
                .populate('owner', 'name email')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async findByOwnerId(ownerId) {
        try {
            return await Turf.find({ owner: ownerId })
                .populate('owner', 'name email')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async findAll(query = {}) {
        try {
            return await Turf.find(query)
                .populate('owner', 'name email')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async updateById(turfId, updateData) {
        try {
            return await Turf.findByIdAndUpdate(
                turfId,
                updateData,
                { new: true }
            ).exec();
        } catch (error) {
            throw error;
        }
    }

    async deleteById(turfId) {
        try {
            return await Turf.findByIdAndDelete(turfId).exec();
        } catch (error) {
            throw error;
        }
    }

    async updateSlotStatus(turfId, day, time, isBooked) {
        try {
            const update = {
                $set: {
                    'availableSlots.$[dayIndex].slots.$[slotIndex].isBooked': isBooked
                }
            };
            const arrayFilters = [
                { 'dayIndex.day': day },
                { 'slotIndex.time': time }
            ];
            
            return await Turf.findOneAndUpdate(
                { _id: turfId },
                update,
                {
                    arrayFilters,
                    new: true
                }
            ).exec();
        } catch (error) {
            throw error;
        }
    }

    async updateBulkSlotStatus(turfId, slotUpdates) {
        try {
            const update = { $set: {} };
            const arrayFilters = [];
    
            slotUpdates.forEach((slot, index) => {
                const day = slot.day;
                const time = slot.time;
                const isBooked = slot.isBooked;
    
                update.$set[`availableSlots.$[dayIndex${index}].slots.$[slotIndex${index}].isBooked`] = isBooked;
    
                arrayFilters.push({ [`dayIndex${index}.day`]: day });
                arrayFilters.push({ [`slotIndex${index}.time`]: time });
            });
    
            return await Turf.findOneAndUpdate(
                { _id: turfId },
                update,
                {
                    arrayFilters,
                    new: true
                }
            ).exec();
        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = new TurfRepository();
