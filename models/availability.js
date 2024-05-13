const mongoose = require('mongoose');

const avalibilitySchema = new mongoose.Schema(
   
        {
        availability: [
            {
                date: {
                    type: Date,
                    required: true
                },
                hours: [
                    {
                        hour: {
                            type: Date,
                            required: true
                        }
                    }
                ]
            }
        ]
    }
    
      
    



 
);

const availability= mongoose.model('availability', avalibilitySchema);
module.exports = availability
