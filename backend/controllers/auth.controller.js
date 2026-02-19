import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    if (!fullName || !email || !mobile || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 digits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json(`sign up error:${error.message}`);
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json({
      message: "User signed in successfully",
      user,
    });
  } catch (error) {
    res.status(500).json(`sign in error:${error.message}`);
  }
};

export const signout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true, 
    });

    return res.status(200).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Sign out error: ${error.message}`,
    });
  }
};


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const otp = Math.floor(1000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; //5 minutes
    user.isOtpVerified = false;
    await user.save();
    await sendOtpMail(email, otp);
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json(`send otp error:${error.message}`);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (String(user.resetOtp) !== String(otp) || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetOtp = undefined;
    user.isOtpVerified = true;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Verify OTP error: ${error.message}`,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({
        message: "OTP verification required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Reset password error: ${error.message}`,
    });
  }
};
export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: false, // prod me true
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Google Auth error: ${error.message}`,
    });
  }
};
