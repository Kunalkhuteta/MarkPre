import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
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
    return res.status(409).json(new ApiError(409, "User with this email already exists"));
  }

  const user = await authService.register({ name, email, password } as any);

  const otp = generateSixDigitsOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);

  user.emailVerificationToken = hashedOTP;
  user.emailVerificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // ✅ Log OTP BEFORE sending email
  console.log("=====================================");
  console.log("🔐 REGISTER OTP");
  console.log("Email:", email);
  console.log("OTP:", otp);
  console.log("=====================================");

  sendMail(user.email, "Verify Your Email - MarkPre", "email-verification-otp", {
    name: user.name,
    otpDigits: otp.split(""),
  })
    .then(() => console.log("✅ Register email sent"))
    .catch((err) => console.error("❌ Register email failed:", err.message));

  res.status(201).json(
    new ApiResponse(201, "Registered successfully. Please verify your email.", {
      userId: user._id,
      email: user.email,
    })
  );
});

// ----------------- LOGIN USER -----------------
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const loginData = await authService.login({ email, password });

  // ✅ If email not verified - generate OTP and return without cookies
  if (!loginData.user.isEmailVerified) {

    const otp = generateSixDigitsOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    // ✅ Log OTP FIRST - always visible even if email fails
    console.log("=====================================");
    console.log("🔐 LOGIN OTP - EMAIL NOT VERIFIED");
    console.log("Email:", email);
    console.log("OTP:", otp);
    console.log("Time:", new Date().toISOString());
    console.log("=====================================");

    loginData.user.emailVerificationToken = hashedOTP;
    loginData.user.emailVerificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await loginData.user.save();

    // ✅ Set cookies so authMiddleware works on /verify-user-email
    res.cookie("accessToken", loginData.accessToken, cookieOptions);
    res.cookie("refreshToken", loginData.refreshToken, cookieOptions);

    // Fire and forget - don't block response
    sendMail(loginData.user.email, "Verify Your Email - MarkPre", "email-verification-otp", {
      name: loginData.user.name,
      otpDigits: otp.split(""),
    })
      .then(() => console.log("✅ Login OTP email sent"))
      .catch((err) => console.error("❌ Login OTP email failed:", err.message));

    return res.status(200).json(
      new ApiResponse(200, "Please verify your email to continue.", {
        user: {
          id: loginData.user._id,
          name: loginData.user.name,
          email: loginData.user.email,
          isEmailVerified: false,
        },
        token: loginData.accessToken,
        requiresVerification: true,
      })
    );
  }

  // ✅ Email verified - normal login
  return res
    .status(200)
    .cookie("accessToken", loginData.accessToken, cookieOptions)
    .cookie("refreshToken", loginData.refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: {
          id: loginData.user._id,
          name: loginData.user.name,
          email: loginData.user.email,
          isEmailVerified: loginData.user.isEmailVerified,
        },
        token: loginData.accessToken,
        requiresVerification: false,
      })
    );
});

// ----------------- LOGOUT USER -----------------
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user.id);
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
});

// ----------------- GET CURRENT USER -----------------
const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }
  res.status(200).json(
    new ApiResponse(200, "Current user fetched successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      plan: user.plan || "free",
    })
  );
});

// ----------------- FORGOT PASSWORD -----------------
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json(new ApiResponse(200, "Password reset link sent to your email"));
});

// ----------------- RESET PASSWORD -----------------
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json(new ApiError(400, "Password must be at least 6 characters long"));
  }
  await authService.resetPassword(token, password);
  res.status(200).json(new ApiResponse(200, "Password reset successful"));
});

// ----------------- GENERATE EMAIL VERIFICATION OTP -----------------
const generateEmailVerificationToken = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json(new ApiError(404, "User not found"));
  if (user.isEmailVerified) return res.status(400).json(new ApiError(400, "Email already verified"));

  const otp = generateSixDigitsOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);

  console.log("=====================================");
  console.log("🔐 RESEND OTP");
  console.log("Email:", user.email);
  console.log("OTP:", otp);
  console.log("=====================================");

  user.emailVerificationToken = hashedOTP;
  user.emailVerificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  sendMail(user.email, "Verify Your Email - MarkPre", "email-verification-otp", {
    name: user.name,
    otpDigits: otp.split(""),
  })
    .then(() => console.log("✅ Resend email sent"))
    .catch((err) => console.error("❌ Resend email failed:", err.message));

  res.status(200).json(new ApiResponse(200, "Verification code sent to your email"));
});

// ----------------- VERIFY EMAIL WITH OTP -----------------
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || token.length !== 6) {
    return res.status(400).json(new ApiError(400, "Invalid verification code"));
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json(new ApiError(404, "User not found"));
  if (user.isEmailVerified) return res.status(400).json(new ApiError(400, "Email already verified"));

  if (!user.emailVerificationToken || !user.emailVerificationTokenExpiry) {
    return res.status(400).json(new ApiError(400, "No verification code found. Please request a new one."));
  }

  if (user.emailVerificationTokenExpiry < new Date()) {
    return res.status(400).json(new ApiError(400, "Verification code expired. Please request a new one."));
  }

  const isValidOTP = await bcrypt.compare(token, user.emailVerificationToken);
  if (!isValidOTP) {
    return res.status(400).json(new ApiError(400, "Invalid verification code"));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  console.log("✅ Email verified:", user.email);

  res.status(200).json(new ApiResponse(200, "Email verified successfully"));
});

// ----------------- REFRESH ACCESS TOKEN -----------------
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json(new ApiError(401, "Refresh token required"));
  }
  try {
    const jwt = await import("jsonwebtoken");
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json(new ApiError(401, "Invalid refresh token"));
    }
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(new ApiResponse(200, "Access token refreshed", { accessToken: newAccessToken }));
  } catch (error) {
    return res.status(401).json(new ApiError(401, "Invalid or expired refresh token"));
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