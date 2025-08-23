import axios, { type InternalAxiosRequestConfig } from "axios";
import qs from "qs";
import * as signalR from "@microsoft/signalr";
import { refreshToken } from "@/services/auth";

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
        await refreshToken();
        return axiosInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export class CustomHttpClient extends signalR.DefaultHttpClient {
  constructor() {
    super(console); // the base class wants a signalR.ILogger
  }
  public async send(request: signalR.HttpRequest): Promise<signalR.HttpResponse> {
    const csrfToken = sessionStorage.getItem("XSRF-TOKEN");
    let tokenHeader = {};
    if (csrfToken) tokenHeader = { "XSRF-TOKEN": csrfToken };
    request.headers = { ...request.headers, ...tokenHeader };

    try {
      const response = await super.send(request);
      return response;
    } catch (er) {
      if (er instanceof signalR.HttpError) {
        const error = er as signalR.HttpError;
        if (error.statusCode == 401) {
          const token = await refreshToken();
          request.headers = { ...request.headers, "XSRF-TOKEN": token };
        }
      } else {
        throw er;
      }
    }
    //re try the request
    return super.send(request);
  }
}
