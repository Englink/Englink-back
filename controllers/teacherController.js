const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const teacher = require('./../models/teacherModel')
const availability = require('../models/availability')




exports.getAllteachers = asyncHandler(async (req, res, next)=>{
    // console.log('e')
   
    const teachers = await teacher.find()
    // console.log(teachers)

    res.status(200).json({
        status:'success',
        teachers
})
})
exports.getAvailableTeachers = asyncHandler(async (req, res, next)=>{
    const selectedDate = req.body.date; 
    
    const availableTeachers = await teacher.find({
        'availability.date': selectedDate
    });
    
   
    
    res.status(200).json({
        status: 'success',
        data: availableTeachers
        
    });
});
exports.updateTeacherAvailability = asyncHandler(async (req, res, next)=>{
    const teacherId = req.body.teacherId; 
    const {month, year,day,hour,minute} = req.body.date;
    const availibleDate = new Date(Date.UTC(year, month-1,day,hour,minute));
    const updatedTeacher = await teacher.findById(teacherId)
    let teacherAvailability = await availability.findById(updatedTeacher.availabilityId)
    // console.log(teacherAvailability)
    let matchingDateIndex = -1
        if (!teacherAvailability)
            {
                const newA =   await availability.create({availability:[{date:availibleDate,hours: [{ hour: availibleDate }] }]});
                updatedTeacher.availabilityId = newA._id
    
            }
        else
        {
            for (const [dateIndex, date] of teacherAvailability.availability.entries()) 
                {
                    if (datesHaveSameDate(date.date, availibleDate)) {
                        matchingDateIndex = dateIndex; // Store the index of the matching date
                        break; // Exit the loop since a match is found
                    }
                }
                if (matchingDateIndex!==-1)
                    {
                        // console.log(teacherAvailability.availability)
                        if (teacherAvailability.availability[matchingDateIndex].hours.some(hour => {
                            return Math.abs(hour.hour.getTime() - availibleDate.getTime()) / 60000 < 20;}))
                                    {
                                return res.status(500).json({
                                    status: 'failed',
                                    messege:'date not availible in this time'
                                    
                                });
                            }
                        else
                        {
                            teacherAvailability.availability[matchingDateIndex].hours.push({hour: availibleDate});
                        }
                    }
                    else
                    {
                        teacherAvailability.availability.push({date: availibleDate,hours: [{ hour: availibleDate }]});
                    }
                        
                }
                await updatedTeacher?.save();
                await teacherAvailability?.save()
                res.status(200).json({
                    status: 'success',
                    teacherId
                    
                });
            });
                        
            function datesHaveSameDate(date1, date2) {
                const year1 = date1.getFullYear();
                const month1 = date1.getMonth();
                const day1 = date1.getDate(); // Add this line to extract the day
                
                
                const year2 = date2.getFullYear();
                const month2 = date2.getMonth();
                const day2 = date2.getDate(); // Add this line to extract the day
            
                // console.log(Math.abs(date1.date.getTime()-date2.getTime())/60000)
                
                // Compare year, month, day, hour, and minute
                return (
                    day1 === day2&&
                    month1 === month2 &&
                    year1 === year2 
                );
            }
    exports.getTeacherAvailability = asyncHandler(async (req, res, next)=>
        {
            const teacherId = req.body.teacherId; 
            const teacherObj = await teacher.findById(teacherId).populate('availabilityId')
            const availability = teacherObj.availabilityId.availability
            res.status(200).json({
                status: 'success',
                availability
                
                
            });






        })




                    
                
                
        
        
        
        

            

    


    
    

