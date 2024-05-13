const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    hour: {
        type: Date,
        required: true
    }
    
    // status: {
    //     type: String,
    //     enum: ['scheduled', 'canceled', 'completed'],
    //     default: 'scheduled'
    // },
    // Add any other fields you need for the appointment
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
