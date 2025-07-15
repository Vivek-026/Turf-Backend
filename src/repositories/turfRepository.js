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

    async addSlots(turfId, slots) {
        return await Turf.findByIdAndUpdate(
            turfId,
            { $push: { availableSlots: { $each: slots } } },
            { new: true }
        ).exec();
    }

    
    async updateSlot(turfId, slotId, slotData) {
        return await Turf.findOneAndUpdate(
            { _id: turfId, 'availableSlots._id': slotId },
            { $set: { 'availableSlots.$': { _id: slotId, ...slotData } } },
            { new: true }
        ).exec();
    }

    
    async deleteSlot(turfId, slotId) {
        return await Turf.findByIdAndUpdate(
            turfId,
            { $pull: { availableSlots: { _id: slotId } } },
            { new: true }
        ).exec();
    }

    
    async updateBulkSlotStatus(turfId, slotUpdates) {
        const turf = await Turf.findById(turfId);
        if (!turf) throw new Error('Turf not found');

        slotUpdates.forEach(update => {
            const slot = turf.availableSlots.id(update.slotId);
            if (slot) {
                if (typeof update.isBooked !== 'undefined') {
                    slot.isBooked = update.isBooked;
                }
                if (typeof update.price !== 'undefined') {
                    slot.price = update.price;
                }
                if (typeof update.day !== 'undefined') {
                    slot.day = update.day;
                }
                if (typeof update.time !== 'undefined') {
                    slot.time = update.time;
                }
            }
        });

        await turf.save();
        return turf;
    }


 
    
}

module.exports = new TurfRepository();
