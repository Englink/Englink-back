const mongoose = require('mongoose');

const avalibilitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    hours: [{
        hour: {
            type: String,
            required: true,
            unique: true
        },
        value: {
            type: Number,
            required: true
        }
    }]
});

const avalibility = mongoose.model('avalibility', avalibilitySchema);

