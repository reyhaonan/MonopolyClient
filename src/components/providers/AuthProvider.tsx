import { useCurrentUser } from "@/services/useCurrentUser";
import { useEffect, type ReactNode } from "react";
import { AuthContext } from "../../context/AuthContext";

type Props = {
  children: ReactNode;
};


export const AuthProvider = ({ children }: Props) => {
  const { data, error, isLoading } = useCurrentUser()

  useEffect(() => {
    if (error) console.log("BREBRE", error)
  }, [error])

  if (isLoading) return <>Loading...</>

  return <AuthContext value={data?.data || null}>{children}</AuthContext>;
};
