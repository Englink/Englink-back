const mongoose = require('mongoose');

const avalibilitySchema = new mongoose.Schema(
    {
    availabilities: [
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
    
      
    ]
}


 
);

const avalibility = mongoose.model('avalibility', avalibilitySchema);

