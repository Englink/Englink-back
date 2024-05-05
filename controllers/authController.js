const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const {promisify} = require('util')
const student = require('./../models/studentModel')
const teacher = require('../models/teacherModel')

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
      expiresIn: "3h"
    });
  };
  
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure : true
    }
    
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
      status: 'success',
      token,
      user
    });
  };
exports.login = asyncHandler(async (req, res, next)=>{
    const {email, password} = req.body
    if(!email || !password) return next(new AppError(403, 'Email or password is missing1'))
    const st = await student.findOne({email})
if (! st || !await  st.checkPassword(password, st.password) )
return next(new AppError(403, 'Email or password is not correct 2'))
    return next(new AppError(403,'everythin ok'))

/* createSendToken(user, 201 , res) */
 
})


exports.register = asyncHandler(async(req, res, next)=>{

    const {email, password} = req.body.userDetails
    const isStudent = req.body.isStudent
    if (!email ||!password)
     return next(new AppError(403,'Request details are missing'))
    const st = await student.findOne({email})

    if (st)
    return next(new AppError(403,'user already in the database'))
    if (isStudent)
      {
    const newStudent = await student.create({email, password})
    createSendToken(newStudent, 201 , res)
      }
      else
      {
        console.log('e')
        const newTeacher = await teacher.create(req.body.userDetails);
        createSendToken(newTeacher, 201 , res)
      }

})


exports.protect = asyncHandler(async(req,res, next)=>{
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return next(new AppError(403, 'Please login '))
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    if(!decoded) return next(new AppError(403, 'Please login '))

    console.log(token)
//     const token = req.headers.cookie.split('=')[1]
//     const {id} = decoded
//     const user = await User.findById(id)
//    if(!user) return next(new AppError(400, 'Please register'))
//      req.user = user
    next()
})
