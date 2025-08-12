import { useCurrentUser } from "@/services/useCurrentUser";
import { useEffect, type ReactNode } from "react";
import { AuthContext } from "../../context/AuthContext";
import LoginView from "../pages/LoginView";

type Props = {
  children: ReactNode;
};


export const AuthProvider = ({ children }: Props) => {
  const { data, error, isLoading } = useCurrentUser()

  useEffect(() => {
    if (error) console.log("BREBRE", error)
  }, [error])

  if (isLoading) return <>Loading...</>

  return data ? <AuthContext value={data.data}>{children}</AuthContext> : <LoginView />
};
