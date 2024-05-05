// commit from maor..


const bcrypt = require('bcryptjs')
const teacherSchema = new mongoose.Schema({
   
    email:{
        type:String,
        required:[true , 'Please provide email'],
        unique: true
    },
    password:{
        type: String,
        required:[true, 'Must be a password'],
        minLength: 8,
        // select: false
    }
    ,
    image:{
        type: String
     
    }
    ,
    desc:{
        type:String
    }

})
// //document middleware - runs b4 actual document is saved in the db "THIS REFERS TO A CURRENT DOCUMENT"
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