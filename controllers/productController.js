const productModel = require('./../models/productModel')

exports.getProducts = async (req, res) => {
    try {
        // Attempt to retrieve products from the database
        const products = await productModel.find()
        // If products are retrieved successfully, send a success response
        res.status(200).json({
            status: 'success',
            products
        });
    } catch (error) {
        // If an error occurs during the retrieval process
        console.error('Error retrieving products:', error);

        // Send a failure response with an error message
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while retrieving products'
        });
    }
};


