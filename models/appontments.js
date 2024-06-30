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
    status: {
        type: String,
        enum: ['scheduled', 'canceled', 'completed'],
        default: 'scheduled'
    }


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

notificationSchema.methods.cancelScheduledJob = async function(jobId) {
    const job = schedule.scheduledJobs[jobId];
    if (job) {
        job.cancel();
        console.log(`Canceled scheduled job: ${jobId}`);
    } else {
        console.log(`Job ID ${jobId} not found in scheduled jobs.`);
    }
};


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;



// status: {
//     type: String,
//     enum: ['scheduled', 'canceled', 'completed'],
//     default: 'scheduled'
// },
// Add any other fields you need for the appointment
