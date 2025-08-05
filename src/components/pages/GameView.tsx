import useGameHub from "@/hooks/useGameHub"
import { useVerifyGame } from "@/services/useVerifyGame"

type Props = {
    gameId: string
}

export const GameView = ({ gameId }: Props) => {


    const { data } = useVerifyGame(gameId);
    const { } = useGameHub(data?.data)

    return <>A</>
}

