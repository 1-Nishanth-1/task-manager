import axios from "axios";
import { getBackendToken } from "./backendToken";

export const api = axios.create({
  // Point to backend API (e.g. http://localhost:4000/api)
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    // Only attach token in the browser
    if (typeof window === "undefined") return config;

    const token = await getBackendToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error shape for the app
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  },
);

export type ApiError = {
  message: string;
  status?: number;
};
