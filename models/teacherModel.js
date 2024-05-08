const mongoose = require('mongoose');

const bcrypt = require('bcryptjs')


const teacherSchema = new mongoose.Schema({
    name:{
        type:String,

    }
    ,
    phone:
    {
        type:String,
    }
    ,
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Must be a password'],
        minLength: 8,
        // select: false
    },
    image: {
        type: String
    },
    gender: {
        type: String,
        required: [true, 'Please provide a gender'],
    },
    desc: {
        type: String,
        // required: [true, 'must be description']
    },
    country:{
        type:String
    }
    ,
    availability: [
        {
            date: {
                type: Date,
                // required: true
            },
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                // required: true
            },
            slots: [
                {
                    start_time: {
                        type: String,
                        // required: true
                    },
                    end_time: {
                        type: String,
                        // required: true
                    }
                }
            ]
        }
    ]
});

teacherSchema.pre('save', async function(next){
    if(!this.isModified('password'))
    return next()
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})
teacherSchema.methods.checkPassword = async function(password,hashedPassword){
    console.log(hashedPassword)
    const checkPasword = await bcrypt.compare(password, hashedPassword)
    return checkPasword
}
const teacher = mongoose.model('teachers', teacherSchema)

module.exports = teacher