import { axiosInstance } from "@/utils/axiosInstance";

export const createGame = () => axiosInstance.post<string>("/game/create");
export const verifyGame = (gameId: string) =>
  axiosInstance.post<string>("/game/verify", undefined, {
    params: {
      gameId,
    },
  });
