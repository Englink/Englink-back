const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, 'Please provide a name'],
    },
    age: {
        type: Number, // 'number' should be 'Number'
        // required: [true, 'Please provide an age'],
    },
    gender: {
        type: String,

        // required: [true, 'Please provide a gender'],
    },
    image: {
        type: String
    },

    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8, // 'minLength' should be 'minlength'
        // select: false
    }
});




    
   
// //document middleware - runs b4 actual document is saved in the db "THIS REFERS TO A CURRENT DOCUMENT"
studentSchema.pre('save', async function(next){
    if(!this.isModified('password'))
    return next()
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})
studentSchema.methods.checkPassword = async function(password,hashedPassword){
    console.log(hashedPassword)
    const checkPasword = await bcrypt.compare(password, hashedPassword)
    return checkPasword
}
const student = mongoose.model('students', studentSchema)

module.exports = student