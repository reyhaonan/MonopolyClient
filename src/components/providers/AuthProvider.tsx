import { useEffect, type ReactNode } from "react";
import { AuthContext } from "../../context/AuthContext";
import LoginView from "../pages/LoginView";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/auth";

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
  });

  useEffect(() => {
    if (error) console.log("BREBRE", error);
  }, [error]);

  if (isLoading) return <>Loading...</>;

  return data ? (
    <AuthContext value={data.data}>{children}</AuthContext>
  ) : (
    <LoginView />
  );
};
