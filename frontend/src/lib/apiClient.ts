import axios from "axios";
import type { AxiosInstance } from "axios";

// ✅ Uses env variable in production, falls back to localhost in dev
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

console.log("🔗 API Base URL:", baseURL);

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh-token");
        return api.request(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);