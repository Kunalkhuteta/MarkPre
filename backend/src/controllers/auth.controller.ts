import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import { Request, Response } from "express";
import { cookieOptions } from "../config/constants";
import authService from "../services/auth.service";
import sendMail from "../config/mailer";
import { generateSixDigitsOTP } from "../config/OTPGenerator";
import bcrypt from "bcryptjs";

// ----------------- REGISTER USER -----------------
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: "User with this email already exists",
      data: null
    });
  }

  const user = await authService.register({ name, email, password } as any);

  // Generate OTP
  const otp = generateSixDigitsOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);

  // 🔥 LOG OTP FOR TESTING
  console.log("=====================================");
  console.log("🔐 GENERATED OTP FOR REGISTRATION");
  console.log("=====================================");
  console.log("User:", email);
  console.log("Name:", name);
  console.log("OTP:", otp);
  console.log("Expires in: 10 minutes");
  console.log("=====================================");

  user.emailVerificationToken = hashedOTP;
  user.emailVerificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Send OTP email
  try {
    const otpDigits = otp.split("");
    const info = await sendMail(user.email, "Verify Your Email - MakeBreak", "email-verification-otp", {
      name: user.name,
      otpDigits,
    });
    console.log("✅ OTP email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    console.log("⚠️ Email failed, but OTP is:", otp);
  }

  return res.status(201).json({
    success: true,
    statusCode: 201,
    message: "User registered successfully. Please check your email for verification code.",
    data: {
      userId: user._id,
      email: user.email,
      name: user.name
    }
  });
});

// ----------------- LOGIN USER -----------------
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const loginData = await authService.login({ email, password });

  // If user is not verified, send OTP
  if (!loginData.user.isEmailVerified) {
    console.log("⚠️ User not verified, generating OTP...");
    
    // Generate OTP
    const otp = generateSixDigitsOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    // 🔥 LOG OTP FOR TESTING
    console.log("=====================================");
    console.log("🔐 GENERATED OTP FOR LOGIN");
    console.log("=====================================");
    console.log("User:", email);
    console.log("Name:", loginData.user.name);
    console.log("OTP:", otp);
    console.log("Expires in: 10 minutes");
    console.log("=====================================");

    loginData.user.emailVerificationToken = hashedOTP;
    loginData.user.emailVerificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await loginData.user.save();

    // Send OTP email
    try {
      const otpDigits = otp.split("");
      await sendMail(loginData.user.email, "Verify Your Email - MakeBreak", "email-verification-otp", {
        name: loginData.user.name,
        otpDigits,
      });
      console.log("✅ OTP email sent to:", email);
    } catch (err) {
      console.error("❌ Email sending failed:", err);
      console.log("⚠️ Email failed, but OTP is:", otp);
    }

    // Return response indicating verification needed
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Please verify your email. Verification code sent.",
      data: {
        user: {
          id: loginData.user._id,
          name: loginData.user.name,
          email: loginData.user.email,
          isEmailVerified: false,
        },
        requiresVerification: true
      }
    });
  }

  // User is verified, proceed with normal login
  res
    .status(200)
    .cookie("accessToken", loginData.accessToken, cookieOptions)
    .cookie("refreshToken", loginData.refreshToken, cookieOptions)
    .json({
      success: true,
      statusCode: 200,
      message: "User logged in successfully",
      data: {
        user: {
          id: loginData.user._id,
          name: loginData.user.name,
          email: loginData.user.email,
          isEmailVerified: loginData.user.isEmailVerified,
        },
        token: loginData.accessToken,
      }
    });
});

// ----------------- LOGOUT USER -----------------
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user.id);

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({
      success: true,
      statusCode: 200,
      message: "User logged out successfully",
      data: null
    });
});

// ----------------- GET CURRENT USER -----------------
const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken");

  if (!user) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: "User not found",
      data: null
    });
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Current user fetched successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      plan: user.plan || "free",
    }
  });
});

// ----------------- FORGOT PASSWORD -----------------
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Password reset link sent to your email",
    data: null
  });
});

// ----------------- RESET PASSWORD -----------------
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Password must be at least 6 characters long",
      data: null
    });
  }

  await authService.resetPassword(token, password);
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Password reset successful",
    data: null
  });
});

// ----------------- GENERATE EMAIL VERIFICATION OTP -----------------
const generateEmailVerificationToken = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: "User not found",
      data: null
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Email already verified",
      data: null
    });
  }

  // Rate limiting
  if (user.emailVerificationTokenExpiry && user.emailVerificationTokenExpiry > new Date()) {
    const secondsRemaining = Math.ceil((user.emailVerificationTokenExpiry.getTime() - Date.now()) / 1000);
    if (secondsRemaining > 540) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: `Please wait ${Math.ceil((600 - (600 - secondsRemaining)) / 60)} minute(s) before requesting a new code`,
        data: null
      });
    }
  }

  // Generate OTP
  const otp = generateSixDigitsOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);

  // 🔥 LOG OTP FOR TESTING
  console.log("=====================================");
  console.log("🔐 RESEND OTP");
  console.log("=====================================");
  console.log("User:", user.email);
  console.log("Name:", user.name);
  console.log("OTP:", otp);
  console.log("Expires in: 10 minutes");
  console.log("=====================================");

  user.emailVerificationToken = hashedOTP;
  user.emailVerificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Send OTP email
  try {
    const otpDigits = otp.split("");
    const info = await sendMail(user.email, "Verify Your Email - MakeBreak", "email-verification-otp", {
      name: user.name,
      otpDigits,
    });
    console.log("✅ OTP email sent:", info.messageId);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Verification code sent to your email",
      data: null
    });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    console.log("⚠️ Email failed, but OTP is:", otp);
    
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to send verification email. Please try again.",
      data: null
    });
  }
});

// ----------------- VERIFY EMAIL WITH OTP -----------------
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || token.length !== 6) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Invalid verification code",
      data: null
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: "User not found",
      data: null
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Email already verified",
      data: null
    });
  }

  if (!user.emailVerificationToken || !user.emailVerificationTokenExpiry) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "No verification code found. Please request a new one.",
      data: null
    });
  }

  if (user.emailVerificationTokenExpiry < new Date()) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Verification code expired. Please request a new one.",
      data: null
    });
  }

  const isValidOTP = await bcrypt.compare(token, user.emailVerificationToken);

  if (!isValidOTP) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Invalid verification code",
      data: null
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  console.log("✅ Email verified successfully for:", user.email);

  // Send success email
  try {
    await sendMail(user.email, "Email Verified Successfully - MakeBreak", "email-verified-success", {
      name: user.name,
    });
  } catch (error) {
    console.error("Success email error:", error);
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Email verified successfully",
    data: null
  });
});

// ----------------- REFRESH ACCESS TOKEN -----------------
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Refresh token required",
      data: null
    });
  }

  try {
    const jwt = await import("jsonwebtoken");
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid refresh token",
        data: null
      });
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json({
        success: true,
        statusCode: 200,
        message: "Access token refreshed",
        data: {
          accessToken: newAccessToken,
        }
      });
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired refresh token",
      data: null
    });
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  generateEmailVerificationToken,
  verifyEmail,
  refreshAccessToken,
};