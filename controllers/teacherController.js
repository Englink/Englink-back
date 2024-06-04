const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const user = require('../models/usersModel')
const reviews = require('../models/reviews')

exports.getAllteachers = asyncHandler(async (req, res, next)=>{
   
    const teachers = await user.find({role:'teacher'})
    res.status(200).json({
        status:'success',
        teachers
})
})

exports.updateTeacherAvailability = asyncHandler(async (req, res, next)=>{

    const tcId =  req.user._id
    const {month, year,day,hour,minute} = req.body.date;
    const availibleDate = new Date(year, month-1,day,hour,minute,0);
        // if availibleDate.getTime() < (Date.now() + 30 * 60 * 1000)

    const teacherDates = await availability.find({teacherId:tcId})

    if (teacherDates.some(dObj=>
        {
            return  Math.abs(dObj.date.getTime() - availibleDate.getTime()) / 60000 < 30;
        }))
        {
            return next(new AppError(500, 'cannot set availability in this date ,becouse already set availability in this time'))
        }
        const teacherLessons = await appointment.find({teacherId:tcId})
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
            const teacherAvailability = await availability.find({ teacherId: tcId })
            .populate({
              path: 'teacherId'})
              
              if(!teacherAvailability)
                  return next(new AppError(500,'availability not found'))
              res.status(200).json({
                  status: 'success',
                  teacherAvailability
              });
          })
             
                    
            
    
        exports.CanceleTeacherAvailability = asyncHandler(async (req, res, next)=>
            {
                const cancelDates = req.body.dates
                const tcId = req.user._id
                
                const datesToRemove = cancelDates.map(date => new Date(date));
                const cancelledDate =  await availability.deleteMany({teacherId: tcId,
                    date: { $in: datesToRemove } });
                    res.status(200).json({
                        status: 'success',
                        cancelledDate                    
                    });
                })
                    
                    
        exports.GetTeacherLessons = asyncHandler(async (req, res, next)=>
            {
                const tcId = req.user._id
                const lessons = await appointment.find({teacherId:tcId})
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
    

     
                
    




        

    





            
            
    
              


                        
                
                
    
    
    
        

          
                

                

              












                    
                
                
        
        
        
        

            

    


    
    

