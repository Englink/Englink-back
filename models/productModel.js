const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    cat: String,
    name: String,
    price: Number,
    image: String
    });



const productModel = mongoose.model('products',productSchema);
module.exports = productModel;
