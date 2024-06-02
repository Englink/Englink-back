module.exports = (err, req, res ,next)=>{
    console.log(err)
    const code = err.code || 500
    res.status(code).json({
        status:'fail',
        message:err.message
   })
}