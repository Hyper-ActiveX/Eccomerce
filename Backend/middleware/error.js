const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err,re,res,next) =>{
    err.statusCode = err.statusCode || 600
    err.message = err.message || "Internal sserver error"

    //wrong mongodb id error
    if(err.name === "CastError"){
        const message= 'Resources not found with this id..Invalid id ${err.path}';
        err = new ErrorHandler(message,404);
    }
    
    // //Duplicate key error
    // if(err.code === 11000){
    //     const message = 'Duplicate ${Object.keys(err.keyValue)} Entered';
    //     err = new ErrorHandler(message,400);
    // }

    // //wrong jwt error
    // if(err.name === "jsonwebTokenError"){
    //     const message = 'Your url is invalid please try agiain';
    //     err = new ErrorHandler(message,400);
    // }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};