const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    }
});

const timeSlotSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: true
    }
});

const daySlotSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
    },
    slots: {
        type: [timeSlotSchema],
        required: true
    }
});

const turfSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Turf name is required']
    },
    location: {
        type: locationSchema,
        required: [true, 'Location is required']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },
    sportTypes: {
        type: [String],
        required: [true, 'At least one sport type is required']
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Price per hour is required']
    },
    images: [{
        type: String
    }],
    amenities: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    /**
     * availableSlots structure:
     * [
     *   { day: 'monday', slots: [ { time: '08:00', isBooked: false }, ... ] },
     *   ...
     * ]
     * Each slot is updated when a booking is made/cancelled.
     */
    availableSlots: {
        type: [daySlotSchema],
        required: [true, 'Available slots are required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update updatedAt timestamp
turfSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add custom methods if needed

const Turf = mongoose.model('Turf', turfSchema);

module.exports = Turf;
