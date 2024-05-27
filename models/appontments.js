const mongoose = require('mongoose');

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
    timeoutId: {
         type: Number,
         default: null } // Field to store the setTimeout identifier

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
    console.log('enter')
    if (this.timeoutId!== null) {
      clearTimeout(this.timeoutId);
    //   console.log('Notification canceled.');
    }
    next();
  });


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
