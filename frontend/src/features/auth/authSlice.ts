import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "./types";
import { loginUser, checkAuthStatus, verifyEmail } from "./authThunk";

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isEmailVerified: false,
  requiresVerification: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.isEmailVerified = action.payload?.isEmailVerified ?? false;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isEmailVerified = false;
      state.requiresVerification = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const payload = action.payload;
        if (!payload) return;

        if (payload.requiresVerification) {
          // ✅ Unverified - store user, set flag, NOT logged in
          state.user = payload.user ?? null;
          state.token = payload.token ?? null;
          state.isLoggedIn = false;
          state.isEmailVerified = false;
          state.requiresVerification = true;
        } else {
          // ✅ Verified - fully log in
          state.user = payload.user ?? null;
          state.token = payload.token ?? null;
          state.isLoggedIn = true;
          state.isEmailVerified = true;
          state.requiresVerification = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Login failed";
        state.isLoggedIn = false;
        state.requiresVerification = false;
      })

      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // ✅ Fixed: thunk returns response.data, so payload IS the full response
        // response.data = { success, statusCode, message, data: { id, name, email, isEmailVerified } }
        const user = action.payload?.data ?? action.payload;
        state.user = user ?? null;
        state.isEmailVerified = user?.isEmailVerified ?? false;
        state.isLoggedIn = true;
        state.requiresVerification = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.isEmailVerified = false;
        state.requiresVerification = false;
        state.loading = false;
      })

      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.isEmailVerified = true;
        state.isLoggedIn = true;
        state.requiresVerification = false;
        if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setToken, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;