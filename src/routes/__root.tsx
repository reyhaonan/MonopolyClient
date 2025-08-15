import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import "@/index.css";
import { Navbar } from "@/components/organisms/Navbar";
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Navbar />
      <Outlet />
    </React.Fragment>
  );
}
