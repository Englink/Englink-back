const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const User = require('../models/usersModel')
const { sendEmail, sendFeedbackRequestEmail,sendZoomLessonInventation,
sendNewLessonEmail} = require('../utils/sending_messages');
const zoom = require('./zoomController')
const dotenv = require('dotenv')
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs'); // For file system operations
dotenv.config();



exports.getAllstudents = asyncHandler(async (req, res, next)=>{
    const students = await User.find({role:'student'})
    res.status(200).json({
        status:'success',
        students
})
})
   





exports.setLesson = asyncHandler(async (req, res, next)=>{
   
    const studentId = req.user._id
    const dateId = req.params.id
    const dateToSet = await availability.findByIdAndDelete(dateId)
    if (dateToSet)
        {
         const tcId = dateToSet.teacherId
         const lesson = await appointment.create({ teacherId: tcId, studentId: studentId, date: dateToSet.date });
         

         // Now perform a separate query to populate the fields
         const populatedLesson = await appointment.findById(lesson._id)
         .populate({
             path: 'teacherId',
         })
         .populate({
             path: 'studentId',
            });
            
        const notificationTime = new Date(dateToSet.date.getTime());
        notificationTime.setMinutes(notificationTime.getMinutes()-2);

        const notificationId = schedule.scheduleJob(notificationTime,async function() {
        const meeting = await zoom.handelZoom(process.env.HOSTEMAIL);
        const joinurl = meeting.join_url;
        await sendZoomLessonInventation(['shlomomarachot@gmail.com'],
        populatedLesson.studentId.name,populatedLesson.teacherId.name,joinurl)
    });
        lesson.notificationJobId = notificationId
        await sendNewLessonEmail(['shlomomarachot@gmail.com'],populatedLesson.teacherId.name,populatedLesson.studentId.name,dateToSet)
    // sendFeedbackRequestEmail('student@example.com', 'Teacher Name', lessonId);

              
        
            
      
            
            
            
       
       res.status(200).json({
             
           status:'success',
           populatedLesson
         })
        }
        else
        {
         console.log('sumthing went wrong');
         return next(new AppError(500, 'sumthing went wrong'))
         
        } 
})







exports.CanceleLesson = asyncHandler(async (req, res, next)=>
    {
        
        const lessonId =  req.params.id;
        const cancelleLesson = await appointment.findById(lessonId);
        if(cancelleLesson)
            {
                await cancelleLesson.deleteOne(); // This will trigger the pre-remove middleware
                const availableDate = cancelleLesson.date
                let response = {
                    status: 'success',
                    cancelleLesson
                };
                
                if (req.user.role === 'student') {
                    const newAvailableDate = await availability.create({ date: availableDate, teacherId: cancelleLesson.teacherId });
                    response.newAvailableDate = newAvailableDate;
                }
                
                res.status(200).json(response);
                                
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

    
    
    
    exports.Update_the_user_information = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = req.user
    const { image, email, password, name, phone, desc} = req.body;
    const updateFields = { image, email, password, name, phone, desc } 
    console.log(updateFields)

    for (const key in updateFields) {
                if (!updateFields[key]|| updateFields[key].trim() === "") {
                    delete updateFields[key];
                }
    }
    
    if (updateFields.hasOwnProperty('password'))
         {
        const newPassword = updateFields.password;
        
        const isSamePassword = await user.checkPassword(newPassword, user.password);
        if (isSamePassword) {
            console.log('New password cannot be the same as the current password');
            return(next(new AppError(500,'New password cannot be the same as the current password')))
            
        }

        user.password = newPassword;
        await user.save(); 
        
        delete updateFields.password;
    }
    if (user.image) {
        const oldImagePath = path.join('../uploads', user.image);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
    if (req.file) {
        const imageUrl = `../uploads/${req.file.filename}`;
        updateFields.image = imageUrl;
        // await user.save();
    }
    
    
    const updatedStudent = await User.findOneAndUpdate(
        { _id: userId },
        updateFields, 
        { new: true, runValidators: true }
    );
    
    if (updatedStudent) {
        res.status(200).json({
            status: 'success',
            updatedStudent
        });
    } else {
        // next(new AppError(500,'Some error occurred during the update'));
        console.log('Some error occurred during the update');
        return(next(new AppError(500,'Some error occurred during the update')))
    }
});
    
    

exports.test = asyncHandler(async (req, res) => {
    console.log('e')
    if (req.headers['authorization'] !== process.env.ZOOM_WEBHOOK_SECRET_TOKEN ) {
        return res.status(401).send('Unauthorized');
      }
        

res.status(200).json({
    status: 'success'
})

    
})
