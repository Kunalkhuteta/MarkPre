export type User = {
  id: string;
  name?: string;
  email: string;
  isEmailVerified: boolean;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  requiresVerification: boolean; // ✅ NEW
  loading: boolean;
  error: string | null;
};