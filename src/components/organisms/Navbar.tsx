import { logout } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import SunIcon from "../atoms/icons/SunIcon";
import MoonIcon from "../atoms/icons/MoonIcon";

export const Navbar = () => {
  const { mutate } = useMutation({
    mutationFn: () => logout(),
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/", reloadDocument: true });
      },
    });
  };

  return (
    <div className="navbar flex items-center mx-auto px-4">
      <Link to="/" className="btn btn-ghost text-xl">
        Monopoly_
      </Link>

      <label className="swap swap-rotate ml-auto">
        {/* this hidden checkbox controls the state */}
        <input
          type="checkbox"
          className="theme-controller"
          value="caramellatte"
        />

        <SunIcon className="swap-off size-6 fill-current" />

        <MoonIcon className="swap-on fill-current" />
      </label>
      <div className="btn btn-ghost" onClick={handleLogout}>
        Logout
      </div>
    </div>
  );
};
