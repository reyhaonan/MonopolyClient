import DiscordLogo from "@/assets/oauth/discord.svg";
import { loginAsGuest } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod";
import Button from "../atoms/Button";
import phrolova from "@/assets/phrolova-ww.gif";
import { getCookie } from "@/utils/cookie";

const schema = z.object({
  username: z.string().min(1)
})

const LoginView = () => {
  const qc = useQueryClient()
  const { mutate: login, isPending } = useMutation({
    mutationFn: (username: string) => loginAsGuest(username)
  })

  const handleLoginAsGuest: SubmitHandler<z.infer<typeof schema>> = (values) => {
    login(values.username, {
      onSuccess: () => {

        localStorage.setItem("XSRF-TOKEN", getCookie("XSRF-TOKEN"));
        qc.refetchQueries({
          queryKey: ["currentUser"]
        })
      }
    })
  }

  const { control, handleSubmit, formState } = useForm({
    values: {
      username: ""
    },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(schema)
  })

  return (
    <div className="mx-auto fixed w-full max-w-md px-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <form onSubmit={handleSubmit(handleLoginAsGuest)} className="mx-auto grid grid-cols-2 gap-4">
        <img className="w-40 mx-auto col-span-2" src={phrolova} />
        <Controller
          control={control}
          name="username"
          render={({ field }) =>
            <input
              type="text"
              placeholder="Your nickname??"
              className="input col-span-2 w-full"
              {...field}
            />
          }
        />
        <Button isLoading={isPending} disabled={!formState.isValid} type="submit" className="btn btn-primary w-full col-span-2">Play</Button>
        <div className="col-span-2 text-center text-xs opacity-40">
          Or login using
        </div>
        <a
          className="ml-auto w-full"
          href="https://discord.com/oauth2/authorize?client_id=1402626488079224862&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Foauth2&scope=identifyhttps://discord.com/oauth2/authorize?client_id=1402626488079224862&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Foauth2&scope=identify"
        >
          <Button type="button" className="btn bg-[#5865f2] w-full">
            <img src={DiscordLogo} className="w-24" alt="discord logo" />
          </Button>
        </a>
      </form>
    </div>
  );
};

export default LoginView;
