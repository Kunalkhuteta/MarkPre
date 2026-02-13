import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  formsLimit?: number;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  lastLogin?: Date;
  forgotPasswordToken?: string | undefined;
  forgotPasswordTokenExpiry?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateResetPasswordToken(): string;
}
