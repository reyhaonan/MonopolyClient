import { axiosInstance } from "@/utils/axiosInstance";
import { getCookie } from "@/utils/cookie";
import axios from "axios";
export const logout = () => axiosInstance.post("/auth/logout");

type User = {
  id: string;
  username: string;
};

type LoginResponse = {
  user: User;
  accessToken: string;
};

export const refreshToken = async () => {
  await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, undefined, {
    withCredentials: true,
  });
  const token = getCookie("XSRF-TOKEN");
  sessionStorage.setItem("XSRF-TOKEN", token);
  return token;
};

export const loginAsGuest = (username: string) =>
  axiosInstance.post<LoginResponse>("/auth/guest", undefined, {
    params: {
      username,
    },
  });

export const getCurrentUser = () => axiosInstance.get<string>("/auth/me");

export const loginDiscord = (code: string) =>
  axiosInstance.post<LoginResponse>("/auth/discord", { code });
