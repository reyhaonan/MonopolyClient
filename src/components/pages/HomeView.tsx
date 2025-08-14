
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import phrolova from '@/assets/phrolova-ww.gif'
import { useAuth } from "@/hooks/useAuth"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as GameAPI from "@/services/game"

export const HomeView = () => {
    const [tempGameId, setTempGameId] = useState("")
    const [gameId, setGameId] = useState("")
    const navigate = useNavigate({ from: "/" })

    const { data } = useQuery({
        enabled: !!gameId,
        queryKey: ["verifyGame", gameId],
        queryFn: () => GameAPI.verifyGame(gameId)
    })
    const { mutate: createGame } = useMutation({
        mutationFn: () => GameAPI.createGame()
    })

    useEffect(() => {
        if (!data) return
        navigate({
            to: "/game",
            search: {
                room: data.data
            },

        })
    }, [data])

    const handleCreateGame = () => {
        createGame(undefined, {
            onSuccess: res => {
                navigate({
                    to: "/game",
                    search: {
                        room: res.data
                    },

                })
            }
        })
    }
    const user = useAuth();
    return (
        <div className="mx-auto">
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 w-max">
                <img className="w-1/2 mx-auto" src={phrolova} />
                {user}
                <input type="text" placeholder="Enter Room Code" className="input w-full" value={tempGameId} onChange={e => setTempGameId(e.target.value)} />
                <button className="btn btn-primary w-full btn-xl" onClick={() => setGameId(tempGameId)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                    Play
                </button>
                <button className="btn w-full btn-ghost" onClick={handleCreateGame}>
                    Create room
                </button>
            </div>
        </div>
    )
}
