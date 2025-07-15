const turfService = require('../services/turfService');
const { BadRequest, Forbidden, NotFound } = require('http-errors');

class TurfController {
    async createTurf(req, res, next) {
        try {
            const { body } = req;
            const turf = await turfService.createTurf(body, req.userId);
            res.status(201).json(turf);
        } catch (error) {
            next(error);
        }
    }

    async getTurfById(req, res, next) {
        try {
            const { id } = req.params;
            const turf = await turfService.getTurfById(id);
            res.json(turf);
        } catch (error) {
            next(error);
        }
    }

    async getTurfs(req, res, next) {
        try {
            const { sportType, city, state, minPrice, maxPrice } = req.query;
            const query = {};

            if (sportType) query.sportTypes = sportType;
            if (city) query['location.city'] = city;
            if (state) query['location.state'] = state;
            if (minPrice) query.pricePerHour = { $gte: parseFloat(minPrice) };
            if (maxPrice) {
                if (!query.pricePerHour) query.pricePerHour = {};
                query.pricePerHour.$lte = parseFloat(maxPrice);
            }

            const turfs = await turfService.getAllTurfs(query);
            res.json(turfs);
        } catch (error) {
            next(error);
        }
    }

    async updateTurf(req, res, next) {
        try {
            const { id } = req.params;
            const { body } = req;
            const turf = await turfService.updateTurf(id, body, req.userId);
            res.json(turf);
        } catch (error) {
            next(error);
        }
    }

    async deleteTurf(req, res, next) {
        try {
            const { id } = req.params;
            const result = await turfService.deleteTurf(id, req.userId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }


    // Add slots to a turf
    async addSlots(req, res, next) {
        try {
            const { id } = req.params;
            const { slots } = req.body;

            if (!Array.isArray(slots) || slots.length === 0) {
                throw new BadRequest('slots must be a non-empty array');
            }

            const turf = await turfService.addSlots(id, slots, req.userId);
            res.status(201).json(turf);
        } catch (error) {
            next(error);
        }
    }

    // Get all slots of a turf
    async getSlots(req, res, next) {
        try {
            const { id } = req.params;
            const turf = await turfService.getTurfById(id);
            res.json(turf.availableSlots);
        } catch (error) {
            next(error);
        }
    }

    // Update a specific slot by ID
    async updateSlot(req, res, next) {
        try {
            const { id, slotId } = req.params;
            const { slotData } = req.body;

            if (!slotData || typeof slotData !== 'object') {
                throw new BadRequest('slotData must be an object');
            }

            const turf = await turfService.updateSlot(id, slotId, slotData, req.userId);
            res.json(turf);
        } catch (error) {
            next(error);
        }
    }

    // Delete a specific slot by ID
    async deleteSlot(req, res, next) {
        try {
            const { id, slotId } = req.params;
            const turf = await turfService.deleteSlot(id, slotId, req.userId);
            res.json(turf);
        } catch (error) {
            next(error);
        }
    }




    async updateSlotStatus(req, res, next) {
        try {

            const { id } = req.params;
            const { slotUpdates } = req.body;
            console.log("id", id);
            console.log("slotUpdates", slotUpdates);
            console.log("userId", req.userId);

            if (!Array.isArray(slotUpdates)) {
                throw new BadRequest('slotUpdates must be an array');
            }

            const turf = await turfService.updateSlotStatus(id, slotUpdates, req.userId);
            res.json(turf);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new TurfController();
