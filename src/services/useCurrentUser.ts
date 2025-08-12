import { axiosInstance } from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: () => axiosInstance<string>("/auth/me"),
  });
