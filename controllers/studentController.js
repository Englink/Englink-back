const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const User = require('../models/usersModel')
const {  sendFeedbackRequestEmail,sendZoomLessonInventation,
sendNewLessonEmail,sendEmailDeleteStudent,sendEmailCanceleLesson} = require('../utils/sending_messages');
const zoom = require('./zoomController')
const dotenv = require('dotenv')
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs'); // For file system operations
const { v4: uuidv4 } = require('uuid');
const { json } = require('body-parser')
const e = require('cors')
const { log } = require('console')

dotenv.config();



exports.getAllstudents = asyncHandler(async (req, res, next)=>{
    const students = await User.find({role:'student'})
    res.status(200).json({
        status:'success',
        students
})
})
   



// && dateToSet.date.getTime() > (Date.now() + 30 * 60 * 1000)


exports.setLesson = asyncHandler(async (req, res, next)=>{
   
    const studentEmail = req.user.email
    const studentId = req.user._id
    const dateId = req.params.id
    const dateToSet = await availability.findByIdAndDelete(dateId)
    if (dateToSet)
        {
         const tcId = dateToSet.teacherId
         console.log(tcId)
         const lesson = await appointment.create({
            teacherId: tcId,
            studentId: studentId,
            date: dateToSet.date,
            notifications: { start: null, end: null }
        });
        const teacher = await User.findById(tcId)
        const teacherEmail = teacher.email
        
        
        // Immediately populate the fields after creation
        const populatedLesson = await appointment.findById(lesson._id)
            .populate('teacherId')
            .populate('studentId');
                
            
        const notificationZoomTime = new Date(dateToSet.date.getTime());
        notificationZoomTime.setMinutes(notificationZoomTime.getMinutes()-2);

        console.log(notificationZoomTime.toLocaleDateString())
        console.log(notificationZoomTime.toLocaleTimeString())
        const notificationStartJobId = uuidv4();
        const notificationEndJobId = uuidv4();  
        schedule.scheduleJob(notificationStartJobId,notificationZoomTime,async function() {
        const meeting = await zoom.handelZoom(process.env.HOSTEMAIL);
        const joinurl = meeting.join_url;
        await sendZoomLessonInventation([studentEmail,teacherEmail],
        populatedLesson.studentId.name,populatedLesson.teacherId.name,joinurl)
    });
    const endMeetingTime = new Date(dateToSet.date.getTime());
    endMeetingTime.setMinutes(notificationZoomTime.getMinutes()+30);
        schedule.scheduleJob(notificationEndJobId,endMeetingTime,async function() {
        })
            sendFeedbackRequestEmail(studentEmail, populatedLesson.teacherId.name, lesson._id);
        
        lesson.notifications.start = notificationStartJobId
        lesson.notifications.end = notificationEndJobId
        lesson.save()
        
    
    await sendNewLessonEmail([studentEmail,teacherEmail],populatedLesson.teacherId.name,populatedLesson.studentId.name,dateToSet)
    
    
    
    
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
        const userName = req.user.name; 
        const userEmail = req.user.email
        let otherEmail = ""
        let otherName = ""
        const cancelleLesson = await appointment.findById(lessonId);
        
        
        if(cancelleLesson)
            {
                await cancelleLesson.deleteOne(); // This will trigger the pre-remove middleware
                const availableDate = cancelleLesson.date
                let response = {
                    status: 'success',
                    cancelleLesson
                };
                
                // let otherEmail, otherName, role;
                if (req.user.role === 'student') {
                    const newAvailableDate = await availability.create({ date: availableDate, teacherId: cancelleLesson.teacherId });
                    response.newAvailableDate = newAvailableDate;
                    const teacher = await User.findById(cancelleLesson.teacherId);
                    otherEmail = teacher.email
                    otherName = teacher.name
                    console.log(otherEmail);
                    console.log(otherName);
                    // role = 'student';

                }
                else{const student = await User.findById(cancelleLesson.studentId);
                    otherEmail = student.email
                    otherName = student.name
                    //  role = 'teacher';
                }
                await sendEmailCanceleLesson(userEmail,userName,otherEmail,otherName,cancelleLesson.date,role);
            
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
    const {  email, password, name, phone, desc,price} = req.body;
    const updateFields = { email, password, name, phone, desc,price } 
    // console.log(req.body)
    // console.log(updateFields)

    for (const key in updateFields) {
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
exports.updateImageProfile = asyncHandler(async (req, res)=>
    {
        const user = req.user
    
        
    
        
        if (user.image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        user.image = req.file.filename;
        await user.save();

        
        
        res.status(200).json({ imagePath:`uploads/${user.image}` });
    

    })
    

exports.deleteImageProfile = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user || !user.image) {
        return res.status(404).json({ message: 'User or image not found' });
    }
    
    // Path to the image file
    const imagePath = path.join(__dirname, '../uploads', user.image);
    
    // Remove the image file from the filesystem
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    // Remove the image reference from the database
    user.image = '';
    await user.save();

        console.log(user.image)
res.status(200).json({
    status: 'success'
})

    
})
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







  












            
            
            







