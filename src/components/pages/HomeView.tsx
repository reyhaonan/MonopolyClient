
import { useCreateGame } from "@/services/useCreateGame"
import { useVerifyGame } from "@/services/useVerifyGame"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import phrolova from '@/assets/phrolova-ww.gif'

export const HomeView = () => {
    const [gameId, setGameId] = useState("")
    const navigate = useNavigate({ from: "/" })

    const { mutate: verifyGame } = useVerifyGame();
    const { mutate: createGame } = useCreateGame();

    const handleVerifyGame = () => {
        verifyGame(gameId, {
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

    return (
        <div className="mx-auto">
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 w-max">
                <img className="w-1/2 mx-auto" src={phrolova} />
                <input type="text" placeholder="Enter Room Code" className="input w-full" value={gameId} onChange={e => setGameId(e.target.value)} />
                <button className="btn btn-primary w-full btn-xl" onClick={handleVerifyGame}>
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
