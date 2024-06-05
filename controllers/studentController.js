const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const User = require('../models/usersModel')
const {  sendFeedbackRequestEmail,sendZoomLessonInventation,
sendNewLessonEmail,sendEmailDeleteStudent} = require('../utils/sending_messages');
const zoom = require('./zoomController')
const dotenv = require('dotenv')
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs'); // For file system operations
const { v4: uuidv4 } = require('uuid');
const { json } = require('body-parser')

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
    // && dateToSet.date.getTime() > (Date.now() + 30 * 60 * 1000)
    if (dateToSet)
        {
         const tcId = dateToSet.teacherId
         const lesson = await appointment.create({
            teacherId: tcId,
            studentId: studentId,
            date: dateToSet.date,
            notifications: { start: null, end: null }
        });
        
        // Immediately populate the fields after creation
        const populatedLesson = await appointment.findById(lesson._id)
            .populate('teacherId')
            .populate('studentId');
                
            
        const notificationZoomTime = new Date(dateToSet.date.getTime());
        notificationZoomTime.setMinutes(notificationZoomTime.getMinutes()-2);

        const notificationStartJobId = uuidv4();
        const notificationEndJobId = uuidv4();  

        schedule.scheduleJob(notificationStartJobId,notificationZoomTime,async function() {
        const meeting = await zoom.handelZoom(process.env.HOSTEMAIL);
        const joinurl = meeting.join_url;
        await sendZoomLessonInventation(['shlomomarachot@gmail.com'],
        populatedLesson.studentId.name,populatedLesson.teacherId.name,joinurl)
    });
    const endMeetingTime = new Date(dateToSet.date.getTime());
    endMeetingTime.setMinutes(notificationZoomTime.getMinutes()+30);
        schedule.scheduleJob(notificationEndJobId,endMeetingTime,async function() {
            sendFeedbackRequestEmail('shlomomarachot@gmail.com', populatedLesson.teacherId.name, lesson._id);
        })
        
        lesson.notifications.start = notificationStartJobId
        lesson.notifications.end = notificationEndJobId
        lesson.save()
        
    
    await sendNewLessonEmail(['shlomomarachot@gmail.com'],populatedLesson.teacherId.name,populatedLesson.studentId.name,dateToSet)
    
    
    
    
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
    console.log(typeof req.body)
    console.log('_____')
    console.log(typeof req.body)
    const { image, email, password, name, phone, desc} = req.body;
    const updateFields = { image, email, password, name, phone, desc } 
    // console.log(req.body)
    // console.log(updateFields)

    for (const key in updateFields) {
        console.log(typeof updateFields[key])
        if (!updateFields[key]|| updateFields[key].trim() === "") {
            delete updateFields[key];
        }
    }
    // console.log(updateFields)
    
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
    if (user.image && req.file) {
        console.log('e')
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
        
            
          
      

exports.DeleteStudent = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const studentName = req.user.name; 
    const role = req.user.role

    // איתור כל התורים הקשורים לתלמיד
    const appointmentsToDelete = await appointment.find({ studentId: userId });
    console.log('Appointments to delete:', appointmentsToDelete);

    // איטרציה על כל תור שנמחק
    for (const appointmentToDelete of appointmentsToDelete) {
        // חילוץ כתובת הדוא"ל של המורה

        const teacher = await User.findById(appointmentToDelete.teacherId);
        if (!teacher) {
            console.error('Teacher not found:', appointmentToDelete.teacherId);
            continue;
        }
        const teacherEmail = teacher.email;

        // // שליחת מייל למורה
        await sendEmailDeleteStudent(teacherEmail, studentName, appointmentToDelete.date,role);
        // console.log('Email sent to:', teacherEmail);

        // הוספת התאריך הפנוי למסד הנתונים
        const newAvailability =  availability.create({
          teacherId: appointmentToDelete.teacherId,
          date: appointmentToDelete.date
        });

        // await newAvailability.save();
        console.log('New availability saved for:', appointmentToDelete.date);

        // מחיקת התור הנוכחי
        await appointment.deleteOne({ _id: appointmentToDelete._id });
        console.log('Appointment deleted:', appointmentToDelete._id);
    }

    // מחיקת התלמיד
    await User.findByIdAndDelete(userId);
    console.log('User deleted:', userId);

    res.status(200).json({
        status: 'success'
    });
   

});







  












            
            
            







