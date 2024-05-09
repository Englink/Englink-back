const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const teacher = require('./../models/teacherModel')
const availability = require('./../models/availibility')




exports.getAllteachers = asyncHandler(async (req, res, next)=>{
   
    const teachers = await teacher.find()

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
    let availibleDate = req.body.date;
    let availiblehours = req.body.hours;
    const updatedTeacher = await teacher.findById(teacherId)
    // console.log(updatedTeacher.availability[0].date)
    console.log("Availability Dates:");
    let matchingDate = updatedTeacher.availability.find(availability => availability.date === availibleDate);
    if(!matchingDate)
        {
            updatedTeacher.availability.push({date:availibleDate,hours:availiblehours})  
            await updatedTeacher.save();
        }
        else
        {
            let mergedHours =  matchingDate.hours.concat(availiblehours)
            matchingDate.hours = mergedHours
            await updatedTeacher.save();
            console.log(mergedHours)
           
            //     const dateToUpdate = matchingDate.hours.find(availability => availability.date === availibleDate);
            
            // updatedTeacher.availability.push({date:availibleDate})  
            // await updatedTeacher.save();
            
        }




    // updatedTeacher.availability.forEach(availability => {


    // });




    
    res.status(200).json({
        status: 'success',
        teacherId
        
    });
});



