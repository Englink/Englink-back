const mongoose = require('mongoose');
const schedule = require('node-schedule');

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
    notificationJobId: {
        type: String // Store the job ID returned by the scheduling library
      }
    

});
appointmentSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.teacherDetails = ret.teacherId;
        delete ret.teacherId;
        ret.studentDetails = ret.studentId;
        delete ret.studentId;
        delete ret.teacherDetails.password;
        delete ret.studentDetails.password;
    }
       
    
    // status: {
    //     type: String,
    //     enum: ['scheduled', 'canceled', 'completed'],
    //     default: 'scheduled'
    // },
    // Add any other fields you need for the appointment
});
appointmentSchema.pre('deleteOne', async function(next) {
    if (this.notificationJobId && schedule.scheduledJobs[this.notificationJobId])
        schedule.scheduledJobs[Appointment.notificationJobId].cancel()
next();
  });


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
