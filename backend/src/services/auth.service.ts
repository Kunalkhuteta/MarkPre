import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import type { IUser } from "../types/user.type";
import sendMail from "../config/mailer";
import crypto from "crypto";

class AuthService {
    constructor(private userModel: typeof User) {}

    async register(userData: IUser): Promise<IUser> {
        const existingUser = await this.userModel.findOne({ email: userData.email });
        if (existingUser) throw new Error("User already exists");

        const user = new this.userModel(userData);
        await user.save();
        return user;
    }

    async login(credentials: { email: string; password: string }): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }> {
        const user = await this.userModel.findOne({ email: credentials.email });
        if (!user) throw new ApiError(401, "User not found with this email");

        const isMatch = await user.comparePassword(credentials.password);
        if (!isMatch) throw new ApiError(401, "Invalid credentials");

        user.lastLogin = new Date();

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return { user, accessToken, refreshToken };
    }

    async logout(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        const resetToken = user.generateResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // ✅ Works for both local and production
        const isProduction = process.env.NODE_ENV === "production";
        const protocol = isProduction ? "https" : "http";
        const domain = process.env.DOMAIN_NAME || "localhost:5173";
        const resetURL = `${protocol}://${domain}/reset-password/${resetToken}`;

        console.log("🔗 Reset URL:", resetURL);

        try {
            await sendMail(
                user.email,
                "Reset Your Password",
                "forgot-password-email",
                {
                    name: user.name,
                    resetLink: resetURL,
                    year: new Date().getFullYear(),
                }
            );

            console.log("✅ Reset email sent to:", user.email);
        } catch (error) {
            console.error("❌ Failed to send reset email:", error);

            // Rollback token if email fails
            user.forgotPasswordToken = undefined;
            user.forgotPasswordTokenExpiry = undefined;
            await user.save({ validateBeforeSave: false });

            throw new ApiError(500, "Email could not be sent. Please try again.");
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            throw new ApiError(400, "Invalid or expired token");
        }

        user.password = newPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;

        await user.save();

        console.log("✅ Password reset successful for:", user.email);
    }
}

export default new AuthService(User);