import { Schema, model } from "mongoose";
import type { IUser } from "../types/user.type";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationTokenExpiry: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordTokenExpiry:{
        type: Date
    },
    refreshToken: {
        type: String
    },
    plan: {
        type: String,
        default: "free"
    }
    
}, { timestamps: true });


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({ _id: this._id, email: this.email, name: this.name, plan: this.plan }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
}

userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.forgotPasswordTokenExpiry = Date.now() + 2 * 24 * 60 * 60 * 1000;

    return resetToken;
};
const User = model<IUser>('User', userSchema);

export default User;
