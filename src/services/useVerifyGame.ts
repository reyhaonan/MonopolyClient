import { axiosInstance } from "@/utils/axiosInstance";
import { useMutation } from "@tanstack/react-query";

export const useVerifyGame = () =>
  useMutation({
    mutationFn: (gameGuid: string) =>
      axiosInstance.post("/game/verify", undefined, {
        params: {
          gameGuid,
        },
      }),
  });
