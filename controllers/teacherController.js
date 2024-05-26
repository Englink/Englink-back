const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const appointment = require('../models/appontments')
const availability = require('../models/availability')
const user = require('../models/usersModel')
const moment = require('moment-timezone');




exports.getAllteachers = asyncHandler(async (req, res, next)=>{
   
    const teachers = await user.find({role:'teacher'})

    res.status(200).json({
        status:'success',
        teachers
})
})
    
   
    
exports.updateTeacherAvailability = asyncHandler(async (req, res, next)=>{
    // console.log(moment.tz.guess())
    const tcId =  req.user._id
    // console.log(tcId)
    const {month, year,day,hour,minute} = req.body.date;
    // const availibleDate = moment.tz(new Date(year, month-1,day,hour,minute,0), "Asia/Jerusalem");

    const availibleDate = new Date(year, month-1,day,hour,minute,0);
    // console.log(new Date(availibleDate).toLocaleTimeString())
    // return next(new AppError(500, 'cannot set availability in this date ,becouse lesson'))

    const teacherDates = await availability.find({teacherId:tcId})
    if (teacherDates.some(dObj=>
        {
            return  Math.abs(dObj.date.getTime() - availibleDate.getTime()) / 60000 < 20;
        }))
        {
            return next(new AppError(500, 'cannot set availability in this date ,becouse already set availability in this time'))
        }
        const teacherLessons = await appointment.find({teacherId:tcId})
        if (teacherLessons.some(dObj=>
            {
                return  Math.abs(dObj.date.getTime() - availibleDate.getTime()) / 60000 < 20;
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
             
                    
            
            // console.log(teacherDates)
            if(!teacherAvailability)
                return next(new AppError(500,'availability not found'))
            res.status(200).json({
                status: 'success',
                teacherAvailability
            });
        })
    
        exports.CanceleTeacherAvailability = asyncHandler(async (req, res, next)=>
            {
                const availabilityId =  req.params.id;
                const cancelledDate = await availability.findByIdAndDelete(availabilityId)
                if(!cancelledDate)
                    return next(new AppError(500,'date not found'))
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
            
            
    
              


                        
                
                
    
    
    
        

          
                

                

              












                    
                
                
        
        
        
        

            

    


    
    

