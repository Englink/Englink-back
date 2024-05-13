const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const {promisify} = require('util')
const student = require('./../models/studentModel')
const teacher = require('../models/teacherModel')

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
      expiresIn: "3d"
    });
  };
  
const createSendToken = (user, statusCode, res,isStudent) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure : true
    }
    if (isStudent)
      res.cookie('studentJwt', token, cookieOptions);
    else
      res.cookie('teacherJwt', token, cookieOptions);

      

      
    res.status(statusCode).json({
      status: 'success',
      token,
      user
    });
  };
exports.login = asyncHandler(async (req, res, next)=>{
  
  const {email, password} = req.body.userDetails
  if(!email || !password) return next(new AppError(403, 'Email or password is missing1'))
    const isStudent = req.body.isStudent
  console.log(req.body)
  if (isStudent)
    {
      const st = await student.findOne({email})
      if (! st || !await  st.checkPassword(password, st.password) )
        {
          return next(new AppError(403, 'Email or password is not correct '))
        }
        createSendToken(st, 201 , res,isStudent) 
      }
      else
      {
          const tc = await teacher.findOne({email})
          if (! tc || !await  tc.checkPassword(password, tc.password) )
            return next(new AppError(403, 'Email or password is not correct '))
          createSendToken(tc, 201 , res,isStudent) 
          
        }
      
    
    // return next(new AppError(403,'everythin ok'))

 
})



exports.register = asyncHandler(async(req, res, next)=>{

      const {email, password} = req.body.userDetails
      const isStudent = req.body.isStudent
      if (!email ||!password)
     return next(new AppError(403,'Request details are missing'))
    
    if (isStudent)
      {
        const st = await student.findOne({email})
        if (st)
        return next(new AppError(403,'student already in the database'))
        const newStudent = await student.create(req.body.userDetails)
        createSendToken(newStudent, 201 , res)
    }
    else
    {
        const tc = await teacher.findOne({email})
        if (tc)
        return next(new AppError(403,'teacher already in the database'))
        const newTeacher = await teacher.create(req.body.userDetails);
        createSendToken(newTeacher, 201 , res)
      }

})



exports.protectStudent = asyncHandler(async(req,res, next)=>{
    // const token = req.headers.authorization.split(' ')[1];
    // if(!token) return next(new AppError(403, 'Please login '))
    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // if(!decoded) return next(new AppError(403, 'Please login '))
      const token = req.cookies.studentJwt
      if(!token) return next(new AppError(403, 'Please login'))
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
      if(!decoded) return next(new AppError(403, 'Please login'))
          const {id} = decoded
          const st = await student.findById(id)
          if(!st) return next(new AppError(400, 'Please register'))
          req.st = st
        // console.log(st)

  
//     const token = req.headers.cookie.split('=')[1]
    next()
})
exports.protectTeacher = asyncHandler(async(req,res, next)=>{
    // const token = req.headers.authorization.split(' ')[1];
    // if(!token) return next(new AppError(403, 'Please login '))
    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // if(!decoded) return next(new AppError(403, 'Please login '))
      const token = req.cookies.teacherJwt
      if(!token) return next(new AppError(403, 'Please login'))
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
      if(!decoded) return next(new AppError(403, 'Please login'))
          const {id} = decoded
          const tc = await teacher.findById(id)
          if(!tc) return next(new AppError(400, 'Please register'))
          req.tc = tc

  
//     const token = req.headers.cookie.split('=')[1]
    next()
})
exports.VallidUser = asyncHandler(async(req,res, next)=>{
  // let user = req.tc?req.tc:req.st;
  // console.log(req)
  res.status(201).json({
    status: 'success',
    // user
    
    
  });

  
})
