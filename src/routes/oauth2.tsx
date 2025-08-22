import { loginDiscord } from "@/services/auth";
import { getCookie } from "@/utils/cookie";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import z from "zod";

const searchValidation = z.object({
  code: z.string(),
});

export const Route = createFileRoute("/oauth2")({
  component: RouteComponent,
  validateSearch: (search) => searchValidation.parse(search),
});

function RouteComponent() {
  const { code } = Route.useSearch();

  const navigate = useNavigate({ from: "/oauth2" });

  const { data } = useQuery({
    queryKey: [code],
    queryFn: async () => {
      const res = await loginDiscord(code);

      sessionStorage.setItem("XSRF-TOKEN", getCookie("XSRF-TOKEN"));
      return res;
    },
  });

  useEffect(() => {
    if (data) navigate({ to: "/" });
  }, [data]);

  return <div>Loading...</div>;
}
