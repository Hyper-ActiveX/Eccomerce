const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err,re,res,next) =>{
    err.statusCode = err.statusCode || 600
    err.message = err.message || "Internal sserver error"

    //wrong mongodb id error
    if(err.name === "CastError"){
        const message= 'Resources not found with this id..Invalid id ${err.path}';
        err = new ErrorHandler(message,404);
    }
    
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};