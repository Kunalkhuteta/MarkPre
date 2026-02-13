export type User = {
  id: string;
  email: string;
  isEmailVerified: boolean;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  error: string | null;
};
