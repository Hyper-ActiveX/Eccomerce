const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err,re,res,next) =>{
    err.statusCode = err.statusCode || 600
    err.message = err.message || "Internal sserver error"

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};