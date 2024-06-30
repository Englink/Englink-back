const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const user = require('../models/usersModel')
const reviews = require('../models/reviews')
const { sendEmailLessonsCanceled} = require('../utils/sending_messages');
const { schedule } = require('node-cron')
const { set } = require('mongoose')

exports.getAllteachers = asyncHandler(async (req, res, next)=>{
   
    const teachers = await user.find({role:'teacher',deletedAt:null})
    res.status(200).json({
        status:'success',
        teachers
})
})

exports.updateTeacherAvailability = asyncHandler(async (req, res, next)=>{

    const tcId =  req.user._id
    const {month, year,day,hour,minute} = req.body.date;
    const availibleDate = new Date(year, month,day,hour,minute,0);
    const currentDate = new Date()
    if(availibleDate.getTime() <= currentDate.getTime())
        {
            return next(new AppError(405, 'cannot set avalability befour current date'))
        }
       

    const teacherDates = await availability.find({teacherId:tcId,status:'available',date:{$gt:currentDate}})
    if(!teacherDates)
        return next(new AppError(401, 'teacher have no availible dates'))

    if (teacherDates.some(dObj=>
        {
            return  Math.abs(dObj.date.getTime() - availibleDate.getTime()) / 60000 < 30;
        }))
        {
            return next(new AppError(500, 'cannot set availability in this date ,becouse already set availability in this time'))
        }
        const teacherLessons = await appointment.find({teacherId:tcId,status:'schedule',date:{$gt:currentDate}})
    if (teacherLessons.some(dObj=>
        {
            return  Math.abs(dObj.date.getTime() - availibleDate.getTime()) / 60000 < 30;
        }))
        {
            return next(new AppError(500, 'cannot set availability in this date ,becouse lesson'))
        }

        
    const newAvailibltiy = await availability.create({date:availibleDate,teacherId:tcId})
    if (newAvailibltiy)
        {
            res.status(200).json({
                status: 'success',
                newAvailibltiy
                
            });
        }
        else
        return next(new AppError(500,'sumthing went wrong'))

    });
    
   
    exports.getTeacherAvailability = asyncHandler(async (req, res, next)=>
        {
            const tcId = req.params.id; 
            const currentDate = new Date(); // Get the current date/time
            const teacherAvailability = await availability.find({ 
              teacherId: tcId,
              date: { $gt: currentDate } ,
              status:'available'
            })
            .populate({
              path: 'teacherId'
            });
                          
              if(!teacherAvailability)
                  return next(new AppError(500,'availability not found'))
              res.status(200).json({
                  status: 'success',
                  teacherAvailability
              });
          })
             
                    
            
    
        exports.CanceleTeacherAvailability = asyncHandler(async (req, res, next)=>
            {
                const cancelDates = req.body.datesToRemove
                const tcId = req.user._id
                // return next(new AppError(500,'availability not found'))

                const datesToRemove = cancelDates.map(date => new Date(date));
                const cancelledDates = await availability.updateMany(
                    { teacherId: tcId, date: { $in: datesToRemove } },
                    { $set: { status: 'unavailable' } }
                );
                        res.status(200).json({
                        status: 'success',
                        cancelledDate: cancelledDates                    
                    });
                })
                    
                    
        exports.GetTeacherLessons = asyncHandler(async (req, res, next)=>
            {
                const tcId = req.user._id
           
                // const appointments1 = await appointment.find({}).select('studentId -_id');
                // const studentIdsInAppointments = new Set(appointments1.map(app => app.studentId.toString()));
                // const students1 = await user.find({ role: 'student' }).select('_id');
                // const studentIdsInUsers = new Set(students1.map(student => student._id.toString()));
                // const studentsWithoutUser = [...studentIdsInAppointments].filter(studentId => !studentIdsInUsers.has(studentId));
                // await appointment.deleteMany({ studentId: { $in: studentsWithoutUser  } });

                // console.log(studentsWithoutUser)
        // Step 1: Retrieve appointments for the given teacherId
        const appointments = await appointment.find({ teacherId: tcId }).select('studentId -_id');
        
        // Step 2: Extract unique student IDs from the appointments
        const studentIdsInAppointments = [...new Set(appointments.map(app => app.studentId.toString()))];

        // Step 3: Retrieve valid student IDs from the users collection
        const validStudents = await user.find({ _id: { $in: studentIdsInAppointments }, role: 'student' }).select('_id');
        const validStudentIds = new Set(validStudents.map(student => student._id.toString()));

        // Step 4: Retrieve and populate appointments conditionally
        const currentDate = new Date()
        const lessons= await appointment.find({ teacherId: tcId, studentId: { $in: [...validStudentIds] },
            date: { $gt: currentDate },status:'scheduled' })
            .populate('teacherId')
            .populate('studentId');
               
                    res.status(200).json({
                        status:'success',
                        lessons
                })
            })

    exports.addStudentReview=asyncHandler(async (req, res, next)=>
        {
            const { comment, stars, lessonId } = req.body;
            
            // Find the lesson to get teacherId and studentId
            const lesson = await appointment.findById(lessonId)
            .populate('teacherId', 'name')
            .populate('studentId', 'name');
            
            if (!lesson) {
                return next(new AppError(404, 'Lesson not found'));
            }
            if (!lesson.teacherId || !lesson.studentId) {
                return next(new AppError(404, 'Teacher or student not found in lesson'));
            }
            
            // Create the review
            const review = await reviews.create({
                comment: comment,
                stars: stars,
                commentDate: new Date(), // Assuming you want to set the current date
                teacherId: lesson.teacherId._id, // Use the populated teacherId
                studentId: lesson.studentId._id // Use the populated studentId
            });
            
            if (!review) {
                return next(new AppError(500, 'Cannot create review'));
            }
            
            const populatedReview = await reviews.findById(review._id)
            .populate('teacherId', 'name')
            .populate('studentId', 'name');
            
            res.status(200).json({
                status: 'success',
                review: populatedReview
                
                
            });
        })
    exports.getTeacherReviews=asyncHandler(async (req, res, next)=>
        {
            const tcId = req.params.id;
            const teacherReviews = await reviews.find({teacherId:tcId})
            .populate('teacherId', 'name')
            .populate('studentId', 'name image');
            res.status(200).json({
                status: 'success',
                teacherReviews: teacherReviews
            });
                
        })
    

exports.DeleteTeacher = asyncHandler(async (req, res, next) =>{
    const userId = req.user._id 
    const teacherName = req.user.name
    const role = req.user.role

    const appointmentsToDelete = await appointment.updateMany(
        { teacherId: userId, status: 'scheduled' },
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
                
            const studentIds = [...new Set(appointmentsToDelete.map(appointment => appointment.studentId))];
            const students = await user.find(
                { _id: { $in: studentIds } },
                { email: 1, name: 1 }
            );

            // Prepare email content for each student
            for (const student of students) {
                const canceledLessons = appointmentsToDelete.filter(appointment => appointment.studentId.toString() === student._id.toString());
                const canceledLessonsInfo = canceledLessons.map(appointment => `Lesson on ${appointment.date.toDateString()}
                with teacher ${teacherName} are cancelled`);
                
                // Send email to student
                await sendEmailLessonsCanceled(student.email, student.name, canceledLessonsInfo.join(', '), 'student');
            }
            await availability.updateMany(
                { teacherId: userId, status: 'available' },
                { $set: { status: 'unavailable' } }
            );
        
            
    
}
    await user.findByIdAndUpdate(userId,{$set:{deletedAt:new Date()}});

    res.status(200).json({
        status: 'success'
    });
   

});


        




      
    

        
    




                
    




        

    





            
            
    
              


                        
                
                
    
    
    
        

          
                

                

              












                    
                
                
        
        
        
        

            

    


    
    

