import { axiosInstance } from "@/utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";

export const useVerifyGame = () =>
  useMutation({
    mutationFn: (gameId: string) =>
      axiosInstance.post("/game/verify", undefined, {
        params: {
          gameId,
        },
      }),
  });
