const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const teacher = require('./../models/teacherModel')




exports.getAllteachers = asyncHandler(async (req, res, next)=>{
   
    const teachers = await teacher.find()

    res.status(200).json({
        status:'success',
        teachers
})
})