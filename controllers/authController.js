const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const {promisify} = require('util')
const user = require('../models/usersModel')
const availability = require('../models/availability')
const appointment = require('../models/appontments')
const nodemailer = require('nodemailer');

const {sendEmailRegisration,sendEmailCreatePasswoed} = require('../utils/sending_messages'); // ייבוא הפונקציה לשליחת המייל

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
      expiresIn: "3d"
    });
  };
  
const createSendToken =async (user, statusCode, res) => {
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
    const { email, password, role } = req.body.userDetails;
  
    if (!email || !password) {
      return next(new AppError(403, 'Email or password is missing'));
    }
  
    if (!role) {
      return next(new AppError(403, 'Role is missing'));
    }
  
    const user1 = await user.findOne({ email,role });
  
    if (!user1 || !await user1.checkPassword(password, user1.password)) {
      return next(new AppError(403, 'Email or password is incorrect'));
    }

    createSendToken(user1, 201, res);
    

  });
  


  exports.register = asyncHandler(async(req, res, next) => {


    const {email, password,role,name} = req.body.userDetails

    if (!email ||!password)
      return next(new AppError(403,'Request details are missing'))
    
        const user1 = await user.find({email})
        if (user1.length > 1)
          {
            
            return next(new AppError(403,'user already register as teacher and as student'))
          }
        if (user1.length == 1 && user1[0].role === role)
          {
            return next(new AppError(403,'user already register with the same role'))
          }
          const newUser = await user.create(req.body.userDetails)
          await sendEmailRegisration(role,name)
          createSendToken(newUser, 201, res);
      
    })
          
    exports.protect = asyncHandler(async(req,res, next)=>{
          const token = req.cookies.userJwt
          if(!token) return next(new AppError(403, 'Please login'))
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
          if(!decoded) return next(new AppError(403, 'Please login'))
              const {id} = decoded
              const user1 = await user.findById(id)
              if(!user1) return next(new AppError(400, 'Please register'))
              req.user= user1
        next()
    })
    
      
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
        
    
    
    exports.validUser = (req,res, next)=>{
      const user = req.user
      res.status(201).json({
        status: 'success',
        user
      });
    }

    exports.forgotPassword = asyncHandler(async(req,res, next)=>
      {
        const { email,role } = req.body;
        if (!email || !role)
          {
            return next(new AppError(403, 'email or role are missing'))
          }
          const user1 = user.findOne({email:email,role:role})
          if(!user1)
            {
              return next(new AppError(403, 'incorrect email'))
            }
           await sendEmailCreatePasswoed(email)
           res.status(201).json({
            status: 'success',
          });
        })
    

           
          

  





            
 exports.DeleteUser  = asyncHandler(async(req, res, next)  =>{

const userId = req.user._id
console.log(req.user._id)

 // מחיקת המשתמש מהדאטה בייס של היוזרים

const availability_to_delete = await availability.findOneAndDelete({teacherId:userId})
console.log("8888");
console.log(availability_to_delete)
//  await appointment.deleteMany({ userId: userId });
// const user_to_delete = await user.findByIdAndDelete(userId);

// // const appointments_to_delete = await appointment.find({ userId: userId });

        
//  if (!user_to_delete) {
//   return next(
//     new AppError(404,'User not found' ));
//  }

 res.status(200).json({
  status: 'success',
  // user_to_delete
  
});


 }      
)
            


 

     
        

  
  
  





  

