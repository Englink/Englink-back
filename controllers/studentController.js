const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const User = require('../models/usersModel')
const {  sendFeedbackRequestEmail,sendZoomLessonInventation,
sendNewLessonEmail,sendEmailLessonsCanceled,sendEmailCanceleLesson} = require('../utils/sending_messages');
const zoom = require('./zoomController')
const dotenv = require('dotenv')
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs'); // For file system operations
const { v4: uuidv4 } = require('uuid');
const { json } = require('body-parser')
const e = require('cors')
const { log } = require('console')
const user = require('../models/usersModel')

dotenv.config();



exports.getAllstudents = asyncHandler(async (req, res, next)=>{
    const students = await User.find({role:'student'})
    res.status(200).json({
        status:'success',
        students
})
})
   





exports.setLesson = asyncHandler(async (req, res, next)=>{
   
    const studentEmail = req.user.email
    const studentId = req.user._id
    const dateId = req.params.id
    const dateToSet = await availability.findById(dateId)
    const currentDate = new Date()

    if (dateToSet && dateToSet.status === 'available' && dateToSet.date > currentDate.getTime())
        {
            const tcId = dateToSet.teacherId
            const lesson = await appointment.create({
                teacherId: tcId,
                studentId: studentId,
                date: dateToSet.date,
                notifications: { start: null, end: null }
            });
            const teacher = await User.findById(tcId)
            const teacherEmail = teacher.email
            dateToSet.status = 'unavailable'
            await dateToSet.save()
        
        
        // Immediately populate the fields after creation
        const populatedLesson = await appointment.findById(lesson._id)
            .populate('teacherId')
            .populate('studentId');
                
            
        const notificationZoomTime = new Date(dateToSet.date.getTime());
        notificationZoomTime.setMinutes(notificationZoomTime.getMinutes()-35);

        const notificationStartJobId = uuidv4();
        const notificationEndJobId = uuidv4();
        
        schedule.scheduleJob(notificationStartJobId,notificationZoomTime,async function() {
        const joinUrl = `https://meet.jit.si/356546546/${notificationStartJobId}`;
        await sendZoomLessonInventation([studentEmail,teacherEmail],
        populatedLesson.studentId.name,populatedLesson.teacherId.name,joinUrl)
    });
    const endMeetingTime = new Date(dateToSet.date.getTime());
    endMeetingTime.setMinutes(notificationZoomTime.getMinutes()+30);
        schedule.scheduleJob(notificationEndJobId,endMeetingTime,async function() {
            sendFeedbackRequestEmail(studentEmail, populatedLesson.teacherId.name, lesson._id);
        })
        
        lesson.notifications.start = notificationStartJobId
        lesson.notifications.end = notificationEndJobId
        await lesson.save()
        
    
    await sendNewLessonEmail(['shlomomarachot@gmail.com',teacherEmail],populatedLesson.teacherId.name,populatedLesson.studentId.name,dateToSet)
    
    
    
    
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
        
        
        if(cancelleLesson && cancelleLesson.status === 'scheduled')
            {
                cancelleLesson.status = 'canceled'
                await cancelleLesson.save()
                const availableDate = cancelleLesson.date
                let response = {
                    status: 'success',
                    cancelleLesson
                };
                if (req.user.role === 'student') {
                    const newAvailableDate = await availability.create({ date: availableDate, teacherId: cancelleLesson.teacherId });
                    response.newAvailableDate = newAvailableDate;
                    const teacher = await User.findById(cancelleLesson.teacherId);
                    otherEmail = teacher.email
                    otherName = teacher.name

                }
                else
                {
                    const student = await User.findById(cancelleLesson.studentId);
                    otherEmail = student.email
                    otherName = student.name
                }
                await sendEmailCanceleLesson(userEmail,userName,otherEmail,otherName,cancelleLesson.date,req.user.role);

            
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
        const currentDate = new Date()
        const lessons = await appointment.find({studentId:stId,date:{$gt:currentDate},status:'scheduled'})
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
        if (!updateFields[key]|| String(updateFields[key]).trim() === "") {
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
        user.image = `../uploads/${req.file.filename}`;
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

    const appointmentsToDelete = await appointment.updateMany(
        { studentId: userId, status: 'scheduled' },
        { $set: { status: 'canceled' } }
    );
    if(appointmentsToDelete && appointmentsToDelete.length > 0)
        {
            for (const appointment of appointmentsToDelete) {
                // Cancel notifications for each appointment
                if (appointment.notifications && appointment.notifications.start) {
                    await appointment.notifications.cancelScheduledJob(appointment.notifications.start);
                }
                if (appointment.notifications && appointment.notifications.end) {
                    await appointment.notifications.cancelScheduledJob(appointment.notifications.end);
                }
            }
                
            const teacherIds = [...new Set(appointmentsToDelete.map(appointment => appointment.teacherId))];
            const teachers = await user.find(
                { _id: { $in: teacherIds } },
                { email: 1, name: 1 }
            );

            // Prepare email content for each teacher
            for (const teacher of teachers) {
                const canceledLessons = appointmentsToDelete.filter(appointment => appointment.teacherId.toString() === teacher._id.toString());
                const canceledLessonsInfo = canceledLessons.map(appointment => `Lesson on ${appointment.date.toDateString()}
                with student ${studentName} are cancelled`);
                
                // Send email to teacher
                await sendEmailLessonsCanceled(teacher.email, teacher.name, canceledLessonsInfo.join(', '), 'teacher');
            }
            
    
}
    await user.findByIdAndUpdate(userId,{$set:{deletedAt:new Date()}});

    res.status(200).json({
        status: 'success'
    });
      

});

exports.someTest = asyncHandler(async( req,res,next)=>
    {
        
    }


)











  












            
            
            







