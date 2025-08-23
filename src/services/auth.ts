import { axiosInstance } from "@/utils/axiosInstance";
export const logout = () => axiosInstance.post("/auth/logout");

type User = {
  id: string;
  username: string;
};

type LoginResponse = {
  user: User;
  accessToken: string;
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
