import type { Player, PlayerWithProperties } from '@/types/Player'

type Props = {
    player: Player | PlayerWithProperties
}

const PlayerIndicator = ({ player }: Props) => {
    return (
        <span className="flex items-center gap-1 capitalize font-bold">
            <span className="w-4 h-4 rounded-full" style={{
                background: player.hexColor
            }}></span>
            {player.name}
        </span>
    )
}

export default PlayerIndicator