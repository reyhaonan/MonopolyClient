import { axiosInstance } from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export const useVerifyGame = (gameId?: string) =>
  useQuery({
    queryKey: ["verifyGame", gameId],
    queryFn: () =>
      axiosInstance.post<string>("/game/verify", undefined, {
        params: {
          gameId,
        },
      }),
  });
