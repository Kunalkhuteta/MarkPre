import axios from "axios";
import type { AxiosInstance } from "axios";
let Baseurl=process.env.NEXT_PUBLIC_API_BASE_URL;
export const api: AxiosInstance = axios.create({
  baseURL: Baseurl,
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
        return api.request(error.config);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);