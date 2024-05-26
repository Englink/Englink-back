const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const {promisify} = require('util')
const user = require('../models/usersModel')
// const nodemailer = require('nodemailer');

const sendEmail = require('../utils/sending_messages'); // ייבוא הפונקציה לשליחת המייל

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
      expiresIn: "3d"
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
      res.cookie('userJwt', token, cookieOptions);

      

      
   res.status(statusCode).json({
      status: 'success',
      token,
      user
    });
  };

  exports.login = asyncHandler(async (req, res, next) => {
    console.log(req)
    const { email, password, role } = req.body.userDetails;
  
    if (!email || !password) {
      return next(new AppError(403, 'Email or password is missing'));
    }
  
    if (!role) {
      return next(new AppError(403, 'Role is missing'));
    }
  
    const user1 = await user.findOne({ email,role });
    console.log(user1)
  
    if (!user1 || !await user1.checkPassword(password, user1.password)) {
      return next(new AppError(403, 'Email or password is incorrect'));
    }
    // if (user1.role !== role) {
    //   return next(new AppError(403, `You are not authorized to log in as a ${role}`));
    // }
  
    createSendToken(user1, 201, res);
  });
  







exports.register = asyncHandler(async(req, res, next) => {
 

     
        


 

  
      const {email, password,role,name} = req.body.userDetails
      // const isStudent = req.body.isStudent
      // console.log(isStudent)
      if (!email ||!password)
     return next(new AppError(403,'Request details are missing'))
    
    // if (isStudent)
    //   {
        const user1 = await user.find({email})
        if (user1.length > 1)
          {

            return next(new AppError(403,'user already register as teacher and as student'))
          }
        if (user1.length == 1 && user1[0].role === role)
          {
            return next(new AppError(403,'user already register with the same role'))
          }
          console.log('e')
          const newUser = await user.create(req.body.userDetails)
            // שליחת מייל אישור רישום
      await sendEmail({
        to: 'pninam56@gmail.com',
        // to: email,
        subject: 'Welcome to Our Website',
        // text: `${role, name}, thank you for registering to LearnLink!`,
        html: `<h1>Welcome ${role} ${name}</h1><p>Thank you for registering to LearnLink!</p>`

      });

      // הגורם המאפשר יצירת טוקן וקוד תגובה 201
      createSendToken(newUser, 201, res);
        createSendToken(newUser, 201 , res)
    // } \
    // else
    // {
    //     const tc = await teacher.findOne({email})
    //     if (tc)
    //     return next(new AppError(403,'teacher already in the database'))
    //     const newTeacher = await teacher.create(req.body.userDetails);
    //     createSendToken(newTeacher, 201 , res,isStudent)
    //   }

// })



exports.protect = asyncHandler(async(req,res, next)=>{
    // const token = req.headers.authorization.split(' ')[1];
    // if(!token) return next(new AppError(403, 'Please login '))
    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // if(!decoded) return next(new AppError(403, 'Please login '))
      const token = req.cookies.userJwt
      if(!token) return next(new AppError(403, 'Please login'))
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
      if(!decoded) return next(new AppError(403, 'Please login'))
          const {id} = decoded
          const user1 = await user.findById(id)
          if(!user1) return next(new AppError(400, 'Please register'))
          req.user= user1
        // console.log(st)

  
//     const token = req.headers.cookie.split('=')[1]
    next()
})
// exports.protectTeacher = asyncHandler(async(req,res, next)=>{
//       const token = req.cookies.teacherJwt
//       if(!token) return next(new AppError(403, 'Please login'))
//         const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
//       if(!decoded) return next(new AppError(403, 'Please login'))
//           const {id} = decoded
//           const tc = await teacher.findById(id)
//           if(!tc) return next(new AppError(400, 'Please register'))
//           req.tc = tc

  
//     next()
// })
exports.restrictTo = (roles) => {
  return (req, res, next) => {
    
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, 'You do not have permission to perform this action')
      );
    }


    next();
  };
};
exports.validUser = asyncHandler(async(req,res, next)=>{
  const user = req.user
  res.status(201).json({
    status: 'success',
    user
  });


  
})

