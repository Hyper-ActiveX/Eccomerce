const ErrorHander = require("../utils/ErrorHandler");
// const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/UserModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const ErrorHandler = require("../utils/ErrorHandler");
const crypto = require("crypto");

// const cloudinary = require("cloudinary");

// Register a User
exports.registerUser = (async (req, res, next) => {
  try{
    //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "myCloud.public_id",
        url: "myCloud.secure_url"
      },
    });

    sendToken(user, 201, res);
    // or we can write
    // const token = user.getJWTToken();
    // return res.status(201).json({
    //     success:true,
    //     //to avoid user to get error from same id registration instead of register we redirect them to there acount
    //     token
    // })
  }catch(error){
    console.log(error);
      return res.status(501).json({success:false, message:error.message});
  }

});

// Login User
exports.loginUser = (async (req, res, next) => {
  
  try{
    const { email, password } = req.body;

    // checking if user has given password and email both

    if (!email || !password) {
      return next(new ErrorHander("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHander("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHander("Invalid password", 401));
    }

    // const token = user.getJWTToken();
    // return res.status(201).json({
    //     success:true,
    //     token
    // })
    sendToken(user, 200, res);
  }catch(error){
    console.log("good api");
    console.log(error);
    return res.status(501).json({success:false, message:error.message});
  }
  
});

// Logout User
exports.logout = (async (req, res, next) => {
  try{
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  }catch(error){
    console.log(error);
    return res.status(501).json({success:false, message:error.message});
  }

});

// Forgot Password
exports.forgotPassword = (async (req, res, next) => {
  try{
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }
  
    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
  
    await user.save({ validateBeforeSave: false });
  
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
  
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHander(error.message, 500));
    }
  }catch(error){
    console.log(error);
    return res.status(501).json({success:false, message:error.message});
  }

});

// Reset Password
exports.resetPassword = (async (req, res, next) => {
  try{
      // creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Reset Password Token is invalid or has been expired",
          400
        )
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHander("Password does not match with new password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  }catch(error){
    console.log(error);
    return res.status(501).json({success:false, message:error.message});
  }

});

// // Get User Detail
exports.getUserDetails = (async (req, res, next) => {
  try{
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  }catch(error){
    console.log(error);
  }

});

// update User password
exports.updatePassword = (async (req, res, next) => {
  try{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  
    if (!isPasswordMatched) {
      return next(new ErrorHander("Old password is incorrect", 400));
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHander("password does not match", 400));
    }
  
    user.password = req.body.newPassword;
  
    await user.save();
  
    sendToken(user, 200, res);
  }catch(error){
    console.log(error);
  }

});

// update User Profile
exports.updateProfile = (async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
  
    // if (req.body.avatar !== "") {
    //   const user = await User.findById(req.user.id);
  
    //   const imageId = user.avatar.public_id;
  
    //   await cloudinary.v2.uploader.destroy(imageId);
  
    //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    //     folder: "avatars",
    //     width: 150,
    //     crop: "scale",
    //   });
  
    //   newUserData.avatar = {
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //   };
    // }
  
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

// Get all users(admin)
exports.getAllUser = (async (req, res, next) => {
  try{
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  }catch(error){
    console.log(error);
  }
});

// Get single user (admin)
exports.getSingleUser = (async (req, res, next) => {
  try{
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`)
      );
    }
  
    res.status(200).json({
      success: true,
      user,
    });
  }catch(error){
    console.log(error);
  }
});

// update User Role -- Admin
exports.updateUserRole = (async (req, res, next) => {
  try{
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
  
    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  }catch(error){
    console.log(error);
  }
});

// Delete User --Admin
exports.deleteUser = (async (req, res, next) => {
  try{
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
  
    // const imageId = user.avatar.public_id;
  
    // await cloudinary.v2.uploader.destroy(imageId);
  
    await user.remove();
  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  }catch(error){
    console.log(error);
  }
});