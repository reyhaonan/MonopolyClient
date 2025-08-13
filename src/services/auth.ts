import { axiosInstance } from "@/utils/axiosInstance";

export const logout = () => axiosInstance.post("/auth/logout");

export const refreshToken = () => axiosInstance.post<string>("/auth/refresh");

type User = {
  Id: string;
  Username: string;
};

type LoginResponse = {
  user: User;
  AccessToken: string;
  RefreshToken: string;
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
