import type { Player, PlayerWithProperties } from '@/types/Player'

type Props = {
    player: Player | PlayerWithProperties
    hideColorIndicator?: boolean
}

const PlayerIndicator = ({ player, hideColorIndicator = false }: Props) => {
    return (
        <span className="flex items-center gap-1 capitalize font-bold">
            {!hideColorIndicator && <span className="w-4 h-4 rounded-full" style={{
                background: player?.hexColor
            }}></span>}
            {player?.name || "Anonymous"}
        </span>
    )
}

export default PlayerIndicator