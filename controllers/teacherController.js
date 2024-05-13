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
    // const { date, slots } = req.body;
    // const { start_time, end_time } = slots[0]; 
        // Find teachers whose availability includes the selected date
    // const availableTeachers = await teacher.find({
    //     'availability': {
    //         $elemMatch: {
    //             'date': date,
    //             'slots': {
    //                 $elemMatch: {
    //                     'start_time': { $lte: start_time }, 
    //                     'end_time': { $gte: end_time } 
    //                 }
    //             }
    //         }
    //     }
    // });
    
   
    
    res.status(200).json({
        status: 'success',
        data: availableTeachers
        
    });
});
exports.updateTeacherAvailability = asyncHandler(async (req, res, next)=>{
    const teacherId = req.body.teacherId; 
    const {month, year,hour,minute} = req.body.date;
    const availibleDate = new Date(Date.UTC(year, month-1,hour,minute));
    const updatedTeacher = await teacher.findById(teacherId)
   
        if (!updatedTeacher.availabilityId)
            {
                const newA =   await availability.create({availability:[{date:availibleDate,hours: [{ hour: availibleDate }] }]});
                updatedTeacher.availabilityId = newA._id
    
            }
        else
        {
            const teacherAvailability = await availability.findById(updatedTeacher.availabilityId)
            const dateobj = teacherAvailability.availability.find((d) => {
                console.log("d.date:", d.date);
                console.log("availibleDate:", availibleDate);
                return d.date === availibleDate;
            });
                        console.log(dateobj)

            
        }

    


    
    // let matchingDateIndex = -1; 
    
    // for (const [dateIndex, date] of availabilities.entries()) {
    //     // Check if the date matches the specific date (without considering the time)
    //     if (datesHaveSameDateAndTimeParts(date, availibleDate)) {
    //         // Match found
    //         matchingDateIndex = dateIndex; // Store the index of the matching date
    //         break; // Exit the loop since a match is found
    //     }
    // }
    // // const dateAndhour = new Date(Date.UTC(year,month-1,1,hour,minute))
    // if (matchingDateIndex !== -1) {
    //     const dateChosen = updatedTeacher.availability[matchingDateIndex];
    //     if (dateChosen.hours.some(hour => {
    //         return Math.abs(hour.hour.getTime() - availibleDate.getTime()) / 60000 < 20;
    //     }))            {
    //            return res.status(500).json({
    //                 status: 'failed',
    //                 messege:'date not availible in this time'
                    
    //             });
            
    //         }
    //         else
    //         {

    //             updatedTeacher.availability[matchingDateIndex].hours.push({hour: availibleDate});
    //         }

        
    // } else {
    //     updatedTeacher.availability.push({ date: availibleDate, hours: [{hour: availibleDate}]});
    // }
    
    await updatedTeacher.save();
    
    
    
    
    res.status(200).json({
        status: 'success',
        teacherId
        
    });
});

function datesHaveSameDateAndTimeParts(date1, date2) {
    const year1 = date1.date.getFullYear();
    const month1 = date1.date.getMonth();
    const day1 = date1.date.getDate(); // Add this line to extract the day
    
    
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
