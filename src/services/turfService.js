const turfRepository = require('../repositories/turfRepository');
const userRepository = require('../repositories/userRepository');
const { BadRequest, Forbidden, NotFound } = require('http-errors');

class TurfService {
    async createTurf(turfData, ownerId) {
        try {
            // Validate required fields
            if (!turfData.name) {
                throw new BadRequest('Turf name is required');
            }
            if (!turfData.location?.address) {
                throw new BadRequest('Location address is required');
            }
            if (!turfData.sportTypes || turfData.sportTypes.length === 0) {
                throw new BadRequest('At least one sport type is required');
            }
            if (!turfData.pricePerHour) {
                throw new BadRequest('Price per hour is required');
            }

            // Add owner ID
            turfData.owner = ownerId;

            // Create turf
            const turf = await turfRepository.create(turfData);
            return turf;
        } catch (error) {
            throw error;
        }
    }

    async getTurfById(turfId) {
        try {
            const turf = await turfRepository.findById(turfId);
            if (!turf) {
                throw new NotFound('Turf not found');
            }
            return turf;
        } catch (error) {
            throw error;
        }
    }

    async getTurfByOwnerId(ownerId) {
        try {
            return await turfRepository.findByOwnerId(ownerId);
        } catch (error) {
            throw error;
        }
    }

    async getAllTurfs(query = {}) {
        try {
            return await turfRepository.findAll(query);
        } catch (error) {
            throw error;
        }
    }

    async updateTurf(turfId, updateData, ownerId) {
        try {
            // Get turf to check ownership
            const turf = await this.getTurfById(turfId);

            // Check if user is owner
            const isOwner = await isAdmin(ownerId);
            if (turf.owner.toString() !== ownerId && !isOwner) {
                throw new Forbidden('Not authorized to update this turf');
            }

            // Update turf
            const updatedTurf = await turfRepository.updateById(turfId, updateData);
            return updatedTurf;
        } catch (error) {
            throw error;
        }
    }

    async deleteTurf(turfId, ownerId) {
        try {
            // Get turf to check ownership
            const turf = await this.getTurfById(turfId);

            // Check if user is owner
            const isOwner = await isAdmin(ownerId);
            if (turf.owner.toString() !== ownerId && !isOwner) {
                throw new Forbidden('Not authorized to delete this turf');
            }

            // Delete turf
            await turfRepository.deleteById(turfId);
            return { message: 'Turf deleted successfully' };
        } catch (error) {
            throw error;
        }
    }


    // Add slots to a turf
    async addSlots(turfId, slots, ownerId) {
        try {
            const turf = await this.getTurfById(turfId);

            const isOwner = await isAdmin(ownerId);
            if (turf.owner.toString() !== ownerId && !isOwner) {
                throw new Forbidden('Not authorized to add slots');
            }

            return await turfRepository.addSlots(turfId, slots);
        } catch (error) {
            throw error;
        }
    }

    // Get all slots for a turf
    async getSlots(turfId) {
        try {
            const turf = await this.getTurfById(turfId);
            return turf.availableSlots;
        } catch (error) {
            throw error;
        }
    }

    // Update a specific slot
    async updateSlot(turfId, slotId, slotData, ownerId) {
        try {
            const turf = await this.getTurfById(turfId);

            const isOwner = await isAdmin(ownerId);
            if (turf.owner.toString() !== ownerId && !isOwner) {
                throw new Forbidden('Not authorized to update slot');
            }

            return await turfRepository.updateSlot(turfId, slotId, slotData);
        } catch (error) {
            throw error;
        }
    }

    // Delete a specific slot
    async deleteSlot(turfId, slotId, ownerId) {
        try {
            const turf = await this.getTurfById(turfId);

            const isOwner = await isAdmin(ownerId);
            if (turf.owner.toString() !== ownerId && !isOwner) {
                throw new Forbidden('Not authorized to delete slot');
            }

            return await turfRepository.deleteSlot(turfId, slotId);
        } catch (error) {
            throw error;
        }
    }





    async updateSlotStatus(turfId, slotUpdates, ownerId) {
        try {
            // Get turf to check ownership
            // console.log("turfId", turfId);
            // console.log("slotUpdates", slotUpdates);
            // console.log("ownerId", ownerId);

            const turf = await this.getTurfById(turfId);

            // Check if user is owner
            const isOwner = await isAdmin(ownerId);
            if (turf.owner.toString() !== ownerId && !isOwner) {
                throw new Forbidden('Not authorized to update slot status');
            }

            // Validate slot updates format
            if (!Array.isArray(slotUpdates)) {
                throw new BadRequest('Slot updates must be an array');
            }

            // Update each slot
            const updatedTurf = await turfRepository.updateBulkSlotStatus(turfId, slotUpdates);
            return updatedTurf;
        } catch (error) {
            throw error;
        }
    }
}

// Helper function to check if user is admin
async function isAdmin(userId) {
    try {
        console.log('[isAdmin] Checking userId:', userId);
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFound('User not found');
        }
        return user.role === 'owner';
    } catch (error) {
        throw error;
    }
}

module.exports = new TurfService();
