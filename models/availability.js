const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    
    date: {
        type: Date,
        required: true
    }
    
});
availabilitySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.teacherDetails = ret.teacherId;
        delete ret.teacherId;
       
    }
});

// status: {
//     type: String,
//     enum: ['scheduled', 'canceled', 'completed'],
//     default: 'scheduled'
// },
// Add any other fields you need for the appointment

const availability = mongoose.model('availability', availabilitySchema);

module.exports = availability;
