import { useAuth } from '@/hooks/useAuth'
import type { Player } from '@/types/Player'
import classNames from 'classnames'

type Props = {
    players: Player[]
    currentPlayerIndex: number
}

const PlayersInfo = ({ players, currentPlayerIndex }: Props) => {
    const playerId = useAuth()
    return (
        <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="p-2 pb-2 text-xs opacity-60 tracking-wide">Players</li>
            {players.map((player, i) =>
                <li className={classNames("list-row flex items-center p-4 flex-wrap", currentPlayerIndex === i && "border border-success")} key={player.id}>

                    <div>
                        <div className="flex items-center gap-1">
                            <span className='font-bold text-lg'>
                                {player.name}
                            </span>
                            {playerId == player.id && <span className="badge badge-primary badge-xs">YOU</span>}
                        </div>
                        <div className="text-xs font-semibold opacity-40">
                            Jail: {player.isInJail ? player.jailTurnsRemaining : "N"}
                            {" | "}
                            Doubles: {player.consecutiveDoubles}
                            {" | "}
                            ID: {player.id.substring(0, 6)}
                        </div>
                    </div>

                    <div className="ml-auto">${player.money}</div>
                </li>
            )}
        </ul>
    )
}

export default PlayersInfo