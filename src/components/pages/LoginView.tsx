import DiscordLogo from "@/assets/oauth/discord.svg";
import { useState } from "react";

const LoginView = () => {
  const [username, setUsername] = useState("");
  return (
    <div className="mx-auto fixed max-w-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <form onSubmit={() => {}} className="mx-auto grid grid-cols-2 gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your nickname??"
          className="input col-span-2"
        />
        <button className="btn btn-primary w-full col-span-2">Play</button>
        <div className="col-span-2 text-center text-xs opacity-40">
          Or login using
        </div>
        <a
          className="ml-auto w-full"
          href="https://discord.com/oauth2/authorize?client_id=1402626488079224862&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Foauth2&scope=identifyhttps://discord.com/oauth2/authorize?client_id=1402626488079224862&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Foauth2&scope=identify"
        >
          <div className="btn bg-[#5865f2] w-full">
            <img src={DiscordLogo} className="w-24" alt="discord logo" />
          </div>
        </a>
      </form>
    </div>
  );
};

export default LoginView;
