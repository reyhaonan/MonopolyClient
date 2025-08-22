import axios, { type InternalAxiosRequestConfig } from "axios";
import { getCookie } from "./cookie";
import qs from "qs";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  paramsSerializer: (params) => {
    return qs.stringify(params);
  },
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, undefined, {
          withCredentials: true,
        });

        sessionStorage.setItem("XSRF-TOKEN", getCookie("XSRF-TOKEN"));
        return axiosInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
