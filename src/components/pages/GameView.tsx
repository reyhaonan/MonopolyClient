import { useAuth } from "@/hooks/useAuth"
import useGameHub from "@/hooks/useGameHub"
import * as GameAPI from "@/services/game"
import { useQuery } from "@tanstack/react-query"

type Props = {
    gameId: string
}

export const GameView = ({ gameId }: Props) => {
    const { data } = useQuery({
        queryKey: ["verifyGame", gameId],
        queryFn: () => GameAPI.verifyGame(gameId)
    })

    const playerId = useAuth()

    const { } = useGameHub(data?.data, playerId || undefined)

    return <>A</>
}

