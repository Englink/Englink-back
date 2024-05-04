const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const student = require('./../models/studentModel')




exports.getAllstudents = asyncHandler(async (req, res, next)=>{
   
    const students = await student.find()

    res.status(200).json({
        status:'success',
        students
})
})