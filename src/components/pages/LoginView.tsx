import DiscordLogo from '@/assets/oauth/discord.svg'
const LoginView = () => {
    return (
        <div>
            <a
                className="ml-auto mr-4"
                href="https://discord.com/oauth2/authorize?client_id=1402626488079224862&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Foauth2&scope=identifyhttps://discord.com/oauth2/authorize?client_id=1402626488079224862&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Foauth2&scope=identify">
                <div className="btn bg-[#5865f2] w-32"><img src={DiscordLogo} alt="discord logo" /></div>
            </a>
        </div>
    )
}

export default LoginView