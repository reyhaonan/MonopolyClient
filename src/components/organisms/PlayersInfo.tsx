import type { Player } from '@/types/Player'
import classNames from 'classnames'
import React from 'react'

type Props = {
    players: Player[]
    currentPlayerIndex: number
}

const PlayersInfo = ({ players, currentPlayerIndex }: Props) => {
    return (
        <div>
            {players.map((player, i) =>
                <div className={classNames("flex items-center p-4 rounded-field", currentPlayerIndex === i && "bg-base-100 border-l-8 border-success")} key={player.id}>
                    <div className="font-semibold mr-auto">{player.name}</div>
                    <div className="">${player.money}</div>
                    <div className="ml-4 opacity-30">{player.currentPosition}</div>
                </div>
            )}
        </div>
    )
}

export default PlayersInfo