const express = require('express');
const mongoose = require('mongoose');

const productRouter = require('./productsRouter/productsRouts')

const app = express();
const port = 3003;

app.use(express.json())
app.use('/api/products', productRouter)
app.use((err, req, res, next) => {
    res.status(500).json({
        status: 'failed',
        message: err.message
    })
})

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'The requested route is not exist on this server'
    })
})





app.listen(port, () => {
    console.log(`Server listsning at http://localhost:${port}`);
});
const connectDB = async (url)=>{
    await  mongoose.connect(url)
    console.log(`Connected to database: ${mongoose.connection.name}`);

  }
  connectDB('mongodb://localhost:27017/productsdb')
.then(()=>{
console.log("The data base has been connected");
})
.catch(err=> console.log(err.message))


module.exports = app 


