const asyncHandler = require('express-async-handler')
const AppError = require('./../utils/AppError')
const teacher = require('./../models/teacherModel')




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



