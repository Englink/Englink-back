const mongoose = require('mongoose');
const schedule = require('node-schedule');

const notificationSchema = new mongoose.Schema({
    start: {
        type: String, // Store the job ID for the start notification
        default: null // Default value for start notification
    },
    end: {
        type: String, // Store the job ID for the before notification
        default: null // Default value for start notification
    },
    // Add more fields for other notification types as needed
});


const appointmentSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    notifications: notificationSchema,
    

});
appointmentSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.teacherDetails = ret.teacherId;
        delete ret.teacherId;
        ret.studentDetails = ret.studentId;
        delete ret.studentId;
        delete ret.teacherDetails.password;
        delete ret.studentDetails.password
    }
    
});

appointmentSchema.pre('deleteOne',{ document: true, query: false }, async function(next) {
    try {
        const notifications = this.notifications;
        
        if (notifications.start && schedule.scheduledJobs[notifications.start]) {
            schedule.scheduledJobs[notifications.start].cancel();
        }

        if (notifications.end && schedule.scheduledJobs[notifications.end]) {
            schedule.scheduledJobs[notifications.end].cancel();
        }

        // Add more cancellation logic for other notification types if needed

        next();
    } catch (err) {
        next(err);
    }

}
);


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;



// status: {
//     type: String,
//     enum: ['scheduled', 'canceled', 'completed'],
//     default: 'scheduled'
// },
// Add any other fields you need for the appointment
