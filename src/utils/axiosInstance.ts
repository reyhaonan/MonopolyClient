import axios, { type InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const csrfToken = sessionStorage.getItem("XSRF-TOKEN");
    if (csrfToken) config.headers["XSRF-TOKEN"] = csrfToken;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
