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
      <div className="bg-base-200 -z-50 fixed inset-0"></div>
      <p className="bottom-1 left-1/2 -translate-x-1/2 fixed opacity-60 text-xs">Made with ❤ for Phrolova</p>
    </React.Fragment>
  );
}
