import type { Player } from '@/types/Player'
import classNames from 'classnames'
import React from 'react'

type Props = {
    players: Player[]
    currentPlayerIndex: number
}

const PlayersInfo = ({ players, currentPlayerIndex }: Props) => {
    return (
        <ul className="list bg-base-200 rounded-box shadow-md">
            <li className="p-2 pb-2 text-xs opacity-60 tracking-wide">Players</li>
            {players.map((player, i) =>
                <li className={classNames("list-row flex items-center p-4 flex-wrap", currentPlayerIndex === i && "bg-base-100 border-success")} key={player.id}>

                    <div>
                        <div className="font-bold capitalize">{player.name}</div>
                        <div className="text-xs font-semibold opacity-60">
                            Jail: {player.isInJail ? player.jailTurnsRemaining : "N"}
                            {" | "}
                            Doubles: {player.consecutiveDoubles}
                        </div>
                    </div>

                    <div className="ml-auto">${player.money}</div>
                </li>
            )}
        </ul>
    )
}

export default PlayersInfo