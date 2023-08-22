import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendMail.js";
import crypto from "crypto"

//login user
//  route port /api/user/auth

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPasswords(password))) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user or password");
  }
});

//register user
// route post /api/users/register

const registerUser = asyncHandler(async (req, res) => {
  // console.log("req.body", req.body);
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//forge password
//api /api/users/forgetpassword

const forgetPassword=asyncHandler(async(req,res)=>{
  const {email}=req.body;
// console.log('email')
  const user=await User.findOne({email});
  if(!user){
    throw new Error("user not found");
  }

  const resetToken=user.getResetToken();
  await user.save()
  // console.log('resetToken',resetToken)
  const url=`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

  const message=`Click on the link to reset your password ${url}. if you have not request then please ignore it`
  await sendEmail(user.email,"Reset password",message)

  res.status(200).json({
    success:true,
    message:` Reset Token has been sent to ${email}`,
    token:resetToken
  })

})


const resetPassword=asyncHandler(async(req,res)=>{
  const {token}=req.params
  const resetPasswordToken=crypto.createHash('sha256').update(token).digest('hex');
  const user=await User.findOne({resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}})

    if(!user){
      throw new Error("user token is invalid or has been expired");
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save()


  res.status(200).json({
    message:"User password successfully updated"
  })

})

//logout user
//rotuer post /api/users/logout

const logOut = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "logout user successfully" });
});

//login user profile
// put /api/users/profile

const getUserProfile = asyncHandler(async (req, res) => {
  // console.log(req.user);
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };
  res.status(200).json(user);
});

//update user profile
//route put /api/users/update

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export { authUser, registerUser, logOut, updateProfile, getUserProfile,forgetPassword,resetPassword };
