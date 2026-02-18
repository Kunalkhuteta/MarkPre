export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,  // required for cross-origin (Vercel → Render)
  maxAge: 7 * 24 * 60 * 60 * 1000,
}