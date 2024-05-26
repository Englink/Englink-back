const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const User = require('../models/usersModel')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sending_messages');






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
         console.log(`Teacher ID: ${tcId}`);
         const lesson = await appointment.create({ teacherId: tcId, studentId: studentId, date: dateToSet.date });
         
         console.log(`Created lesson: ${lesson}`);

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
                   
         
             // שליחת מייל למורה
        const teacher = await User.findById(tcId);
        console.log(teacher);
        console.log(teacher.email);
        console.log( req.user.email);
        await sendEmail({
            // to: teacher.email, // כתובת המייל של המורה
            to:'shlomoww@gmail.com',
            subject: 'New Lesson Scheduled', // כותרת המייל למורה
            text: `A new lesson has been scheduled for you on ${dateToSet.date}`, // תוכן המייל למורה
            html: `<h1>New Lesson Scheduled</h1><p>A new lesson has been scheduled for you on ${dateToSet.date}with the student ${req.user.name}</p>` // תוכן המייל ב-HTML למורה
        });

        // שליחת מייל לתלמיד
        await sendEmail({
           
            // to: req.user.email, // הכתובת של התלמיד מהבקשה
            to:'204gps@gmail.com',
            subject: 'New Lesson Scheduled', // כותרת המייל לתלמיד
            text: `A new lesson has been scheduled with the teacher on ${dateToSet.date}`, // תוכן המייל לתלמיד
            html: `<h1>New Lesson Scheduled</h1><p>A new lesson has been scheduled with the teacher ${teacher.name}on ${dateToSet.date}</p>` // תוכן המייל ב-HTML לתלמיד
        });

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

// אופצייה ג

// פונקציית העדכון של המידע של המשתמש
exports.Update_the_user_information = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const updateFields = req.body.userDetails; // קח את כל המפתחות והערכים לעדכון

    // לולאה שתבדוק שאם יש מפתחות שהערך שלהם הוא ריק אז הוא ימחוק אותו מהאובייקט
    for (const key in updateFields) {
        if (updateFields[key].trim() === "") {
            delete updateFields[key];
        }
    }

    // console.log(updateFields);

    if (updateFields.hasOwnProperty('password')) {
        const newPassword = updateFields.password;
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found');
            return next(new AppError('User not found', 404));
        }

        // בדיקת סיסמה חדשה מול סיסמה נוכחית
        // console.log(newPassword);
        // console.log(user.password);
        const isSamePassword = await user.checkPassword(newPassword, user.password);
        if (isSamePassword) {
            console.log('New password cannot be the same as the current password');
            return(next(new AppError(500,'New password cannot be the same as the current password')))
           
        }

        // // עדכון הסיסמה החדשה, הפונקציה `pre('save')` תטפל בהצפנה
        user.password = newPassword;
        await user.save(); // שמירת המשתמש תפעיל את הפונקציה `pre('save')`

        // מחיקת הסיסמה מ-updateFields כך שלא תתעדכן שוב בשימוש ב-findOneAndUpdate
        delete updateFields.password;
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
