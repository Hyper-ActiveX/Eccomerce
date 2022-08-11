const ErrorHander = require("../utils/ErrorHandler");
// const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.isAuthenticatedUser = (async (req, res, next) => {
    try{
        const { token } = req.cookies;

        if (!token) {
          return next(new ErrorHander("Please Login to access this resource", 401));
        }
      
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
      
        req.user = await User.findById(decodedData.id);
      
        next();
    }catch(error){
        console.log(error);
        return res.status(501).json({success:false, message:error.message});
    }
});

// only admin roles can create a product
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};