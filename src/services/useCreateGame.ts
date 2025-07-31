import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../utils/axiosInstance";

export const useCreateGame = () =>
  useMutation({
    mutationFn: () => axiosInstance.post<string>("/game/create"),
  });
