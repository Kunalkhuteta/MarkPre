import { z } from "zod";

const userSchema = z.object({
    id: z.string({message: "Invalid ID format"}).optional(),
    name: z.string({message: "Invalid name format"}).min(2).max(100),
    email: z.string({message: "Invalid email format"}).email(),
    password: z.string({message: "Invalid password format"}).min(6).max(100),
    isEmailVerified: z.boolean().default(false),
    plan: z.enum(['free', 'basic', 'pro', 'enterprise']).default('free'),
    subscriptionId: z.string({message: "Invalid subscription ID format"}).uuid().optional(),
    subscriptionStatus: z.enum(['active', 'canceled', 'past_due', 'trialing']).optional(),
    trialEndsAt: z.date().optional(),
    subscriptionEndsAt: z.date().optional(),
    emailVerificationToken: z.string({message: "Invalid email verification token format"}).uuid().optional(),
    emailVerificationTokenExpires: z.date().optional(),
    lastLogin: z.date().optional(),
    refreshToken: z.string().optional(),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
});

export type UserSchemaType = z.infer<typeof userSchema>;
export {userSchema};