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
    ,
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    }

    
});
availabilitySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.teacherDetails = ret.teacherId;
        delete ret.teacherId;
        delete ret.teacherDetails.password

       
    }
});


const availability = mongoose.model('availability', availabilitySchema);

module.exports = availability;
