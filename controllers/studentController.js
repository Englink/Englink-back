const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const User = require('../models/usersModel')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sending_messages');
const cron = require('node-cron');
const zoom = require('./zoomController')
const dotenv = require('dotenv')
const schedule = require('node-schedule');
const path = require('path');
const fs = require('fs'); // For file system operations






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
    // console.log(`Received studentId: ${studentId} and dateId: ${dateId}`);
    const dateToSet = await availability.findByIdAndDelete(dateId)
    // console.log(`dateToSet: ${dateToSet}`);
  
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
            const now = new Date()
            const notificationTime = new Date(dateToSet.date.getTime());
            notificationTime.setMinutes(notificationTime.getMinutes()-2);
            console.log(notificationTime)
            schedule.scheduleJob(notificationTime,async function() {

                try {
                    const meeting = await zoom.handelZoom(process.env.HOSTEMAIL);
                    const joinurl = meeting.join_url;
        
                    await sendEmail({
                        to: 'shlomomarachot@gmail.com',
                        subject: `Welcome to the lesson ${populatedLesson.studentId.name}!`,
                        html: `<p>Welcome to the lesson with teacher ${populatedLesson.teacherId.name}, lesson zoom link: <br> ${joinurl}</p>`
                    });
        
                    await sendEmail({
                        to: 'shlomomarachot@gmail.com',
                        subject: `Welcome to the lesson ${populatedLesson.teacherId.name}!`,
                        html: `<p>Welcome to the lesson with student ${populatedLesson.studentId.name}, lesson zoom link: <br> ${joinurl}</p>`
                    });
                } catch (error) {
                    console.error('Error scheduling email:', error);
                }
            });
        
            
            
            
            await sendEmail({to:'shlomomarachot@gmail.com',subject: `new lesson shedulde`,
            html: `<p>A new lesson shedulde added with teacher 
         ${populatedLesson.teacherId.name} on date ${dateToSet.date.toLocaleDateString()} at hour ${dateToSet.date.toLocaleTimeString()}
         </p>` 
       });
            await sendEmail({to:'shlomomarachot@gmail.com',subject: `new lesson shedulde`,
            html: `<p>A new lesson shedulde added with student 
            ${populatedLesson.studentId.name} on date ${dateToSet.date.toLocaleDateString()} at hour ${dateToSet.date.toLocaleTimeString()}
            </p>` 
       });
       
       //  dateToSet.timeoutId = timeoutId;
       //  console.log(populatedLesson)
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
                await appointment.findByIdAndDelete(lessonId)
                if (req.user.role === 'student') {
                    console.log(availableDate)
                    const newAvailableDate = await availability.create({ date: availableDate,teacherId:cancelleLesson.teacherId });
                    
                    res.status(200).json({
                        status: 'success',
                        newAvailableDate,
                        cancelleLesson // Include the new available date in the response
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

    
    
    
    
    // אופצייה ג
    
    // פונקציית העדכון של המידע של המשתמש
    exports.Update_the_user_information = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = req.user
    const { image, email, password, name, phone, desc, role } = req.body;
    const updateFields = { image, email, password, name, phone, desc, role } 
    console.log(updateFields)
    // לולאה שתבדוק שאם יש מפתחות שהערך שלהם הוא ריק אז הוא ימחוק אותו מהאובייקט
    for (const key in updateFields) {
                if (!updateFields[key]|| updateFields[key].trim() === "") {
                    delete updateFields[key];
                }
    }
    
    
    // console.log(updateFields);
    
    if (updateFields.hasOwnProperty('password')) {
        const newPassword = updateFields.password;
        
        const isSamePassword = await user.checkPassword(newPassword, user.password);
        if (isSamePassword) {
            console.log('New password cannot be the same as the current password');
            return(next(new AppError(500,'New password cannot be the same as the current password')))
            
        }

        user.password = newPassword;
        await user.save(); // שמירת המשתמש תפעיל את הפונקציה `pre('save')`
        
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
        updateFields, // השתמש באובייקט שלם לעדכון
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

exports.notify = asyncHandler(async (req, res, next) => {
    
    const now = new Date();
    const notificationTime = new Date(now.getTime() + 10 * 60 * 1000); // 5 minutes before appointmentTime
    const delay = notificationTime.getTime() - now.getTime();
    // currentDate.setMinutes(currentDate.getMinutes() +10);
    // const delay = 1000 * 60 *2
    setTimeout(async () => {
            await sendEmail({to:'shlomomarachot@gmail.com',subject: 'New Lesson Scheduled',
            text: `A new lesson has been scheduled with the teacher on ${now}`, // תוכן המייל לתלמיד
        html: `<h1>New Lesson Scheduled</h1><p>A new lesson has been scheduled with the teacher ${'teacher.name'}on ${now.toLocaleTimeString()}</p>` // תוכן המייל ב-HTML לתלמיד
        
    });
}, delay);

res.status(200).json({
    status: 'success'
})

// await sendEmail({
    //     // to: req.user.email, // הכתובת של התלמיד מהבקשה
    //     to:'shlomomarachot@gmail.com',
    //     subject: 'New Lesson Scheduled', // כותרת המייל לתלמיד
    //     text: `A new lesson has been scheduled with the teacher on ${dateToSet.date}`, // תוכן המייל לתלמיד
    //     html: `<h1>New Lesson Scheduled</h1><p>A new lesson has been scheduled with the teacher ${teacher.name}on ${dateToSet.date.toLocaleTimeString()}</p>` // תוכן המייל ב-HTML לתלמיד
    // });
           
    
    
})
//         const delay = notificationTime.getTime() - now.getTime();
//         console.log(delay)
//         const timeoutId =   setTimeout(async () => {
//             const meeting = await zoom.handelZoom( process.env.HOSTEMAIL)
//             // console.log(meeting)
//             const joinurl = meeting.join_url
//             await sendEmail({to:'shlomomarachot@gmail.com',subject: `welcom to the lesson ${populatedLesson.studentId.name} !`,
//          html: `<p>welcome to the lesson with teacher
//          ${populatedLesson.teacherId.name}
//          ,lesson zoom link
//          <br> ${joinurl}</p>` 
//         });
//         await sendEmail({to:'shlomomarachot@gmail.com',subject: `welcom to the lesson ${populatedLesson.teacherId.name} !`,
//         html: `<p>welcome to the lesson with student
//         ${populatedLesson.studentId.name}
//         ,lesson zoom link
//         <br> ${joinurl}</p>` 
//     });
    
// }, delay);
