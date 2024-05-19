const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const user = require('../models/usersModel')




exports.getAllstudents = asyncHandler(async (req, res, next)=>{
   
    const students = await user.find({role:'student'})

    res.status(200).json({
        status:'success',
        students
})
})
exports.setLesson = asyncHandler(async (req, res, next)=>{
   
    const studentId = req.user._id
    const dateId = req.params.id
    const dateToSet =await availability.findByIdAndDelete(dateId)
    // console.log(dateToSet)
    if (dateToSet)
        {
         const tcId = dateToSet.teacherId
         const lesson = await appointment.create({ teacherId: tcId, studentId: studentId, date: dateToSet.date });

         // Now perform a separate query to populate the fields
         const populatedLesson = await appointment.findById(lesson._id)
         .populate({
             path: 'teacherId',
             select: '-password -email' // Exclude 'password' and 'email' fields from the populated teacherId document
         })
         .populate({
             path: 'studentId',
             select: '-password -email' // Exclude 'password' and 'email' fields from the populated studentId document
         });
                         
            res.status(200).json({
                status:'success',
                populatedLesson
        })
        }
    else
    {
        return next(new AppError(500, 'sumthing went wrong'))
    } 




})
exports.CanceleLesson = asyncHandler(async (req, res, next)=>
    {

        const lessonId =  req.params.id;
        const cancelleLesson = await appointment.findByIdAndDelete(lessonId)
        if(cancelleLesson)
            {
                const availableDate = cancelleLesson.date
                await appointment.findByIdAndDelete(lessonId)
                if (req.user.role === 'student') {
                    console.log(availableDate)
                    const newAvailableDate = await availability.create({ date: availableDate,teacherId:cancelleLesson.teacherId });
                    
                    res.status(200).json({
                        status: 'success',
                        newAvailableDate,
                        cancelleLesson, // Include the new available date in the response
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        cancelleLesson
                    });
                }
                            }
        else 
        {
            return next(new AppError(500, 'cancelled date not found'))
        }
      
    })
exports.GetStudentsLessons = asyncHandler(async (req, res, next)=>
    {
        const stId = req.user._id
        const lessons = await appointment.find({studentId:stId})
        .populate({
            path: 'teacherId'
        })
        .populate({
            path: 'studentId'
        });
                        
           res.status(200).json({
               status:'success',
               lessons
       })



      
    })




