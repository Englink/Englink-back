const express = require('express');
const mongoose = require('mongoose');
const globalErrorHandler = require('./utils/errorHandler')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express();
const zoom = require('./controllers/zoomController')
const studentRouter = require('./routes/studentRoutes')
const teacherRouter = require('./routes/teacherRouter');
// console.log(new Date('2024/6/20').getMonth())
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}
app.use('/uploads', express.static('uploads'));
  
app.use(cookieParser());
dotenv.config()

const corsOptions = {
    origin:true,
    credentials:true
}
app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/students',studentRouter)
app.use('/api/teachers',teacherRouter)
// app.get('/zoom',zoom.handelZoom)

app.all('*', (req, res) => {
    //change
    res.status(404).json({
        status: 'fail',
        message: 'The requested route is not exist on this server'
    })
})
app.use(globalErrorHandler)

const port = 3003;
app.listen(port, () => {
    console.log(`Server listsning at http://localhost:${port}`);
});
const connectDB = async (url)=>{
    await  mongoose.connect(url)
    console.log(`Connected to database: ${mongoose.connection.name}`);
    
}
connectDB(process.env.MONGO_ATLAS)
.then(()=>{
    console.log("The data base has been connected");
})
.catch(err=> console.log(err.message))


module.exports = app 






















// app.post('/webhook', (req, res) => {
//     console.log('e')
//     console.log('Headers:', req.headers);
//     console.log('Body:', req.body);

//     // Construct the message string
//     const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`;
    
//     // Hash the message string with your Webhook Secret Token and prepend the version semantic
//     const hashForVerify = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
//                                 .update(message)
//                                 .digest('hex');
//     const signature = `v0=${hashForVerify}`;

//     // Validate the request came from Zoom
//     if (req.headers['x-zm-signature'] === signature) {
//         // Handle Zoom's URL validation event
//         if (req.body.event === 'endpoint.url_validation') {
//             const { plainToken } = req.body.payload;
//             const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
//                                            .update(plainToken)
//                                            .digest('hex');

//             const response = {
//                 plainToken: plainToken,
//                 encryptedToken: hashForValidate
//             };

//             console.log('Validation response:', response);
//             return res.status(200).json(response);
//         }
//         // Handle other events
//         console.log('Webhook received:', req.body);
//         return res.status(200).send('Event received');
//     } else {
//         // If signature verification fails
//         console.log('Invalid signature');
//         return res.status(401).send('Unauthorized');
//     }
// });
