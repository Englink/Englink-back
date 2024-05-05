const express = require('express');
const mongoose = require('mongoose');
const AppError = require('./utils/AppError')
const globalErrorHandler = require('./utils/errorHandler')
const dotenv = require('dotenv')
dotenv.config()

const productRouter = require('./routes/productsRouts')
const studentRouter = require('./routes/studentRoutes')
const teacherRouter = require('./routes/teacherRouter')

const app = express();
const port = 3003;

app.use(express.json())
app.use('/api/products', productRouter)
app.use('/api/students',studentRouter)
app.use('/api/teachers',teacherRouter)
app.use((err, req, res, next) => {
    res.status(500).json({
        status: 'failed',
        message: err.message
    })
})

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


