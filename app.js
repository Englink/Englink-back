const express = require('express');
const mongoose = require('mongoose');
const AppError = require('./utils/AppError')
const globalErrorHandler = require('./utils/errorHandler')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express();
const zoom = require('./controllers/zoomController')



app.use(cookieParser());

dotenv.config()
const corsOptions = {
    origin:true,
    credentials:true
}


app.use(cors(corsOptions))
const studentRouter = require('./routes/studentRoutes')
const teacherRouter = require('./routes/teacherRouter')

const port = 3003;

app.use(express.json())
app.use('/api/students',studentRouter)
app.use('/api/teachers',teacherRouter)
app.get('/zoom',zoom.handelZoom)

app.all('*', (req, res) => {
    //change
    res.status(404).json({
        status: 'fail',
        message: 'The requested route is not exist on this server'
    })
})
app.use(globalErrorHandler)





app.listen(port, () => {
    console.log(`Server listsning at http://localhost:${port}`);
});
const connectDB = async (url)=>{
    await  mongoose.connect(url)
    console.log(`Connected to database: ${mongoose.connection.name}`);

  }
  connectDB(process.env.MONGO_COMPASS)
.then(()=>{
console.log("The data base has been connected");
})
.catch(err=> console.log(err.message))


module.exports = app 


