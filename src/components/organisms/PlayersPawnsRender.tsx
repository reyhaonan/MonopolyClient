import type { Player } from '@/types/Player'
import classNames from 'classnames'
import { useMemo } from 'react'

type Props = {
    players: Player[]
    currentPlayerIndex: number
    tileHeight: number
    tileWidth: number
}

const pawnOffsets = [
    [
        { x: 0, y: 0 },
        { x: -16, y: 0 },
        { x: 16, y: 0 },
        { x: -32, y: 0 },
        { x: 32, y: 0 },
        { x: -48, y: 0 },
        { x: 48, y: 0 },
    ],
    [
        { x: 0, y: 0 },
        { x: 0, y: -16 },
        { x: 0, y: 16 },
        { x: 0, y: -32 },
        { x: 0, y: 32 },
        { x: 0, y: -48 },
        { x: 0, y: 48 },
    ],
];

export const createMockPlayers = (names: string[], startingPosition: number): Player[] => {
    return names.map((name, index) => ({
        id: `player-${index + 1}`,
        name: name,
        money: 1500,
        currentPosition: startingPosition,
        isInJail: false,
        jailTurnsRemaining: 0,
        getOutOfJailFreeCards: 0,
        consecutiveDoubles: 0,
        propertiesOwned: [],
        isBankrupt: false,
        hexColor: "#FFFFFF"
    }));
}

const PlayersPawnsRender = ({ players, tileHeight, tileWidth, currentPlayerIndex }: Props) => {

    // const players = createMockPlayers(["apple", "banana", "cherry", "date", "elderberry", "fig", "boy"], 20)
    const monopolyBoardPositions = useMemo(() => generateMonopolyPositions(tileHeight, tileWidth), [tileHeight, tileWidth])

    const spacesOccupied = players.reduce((prev, p) => {
        prev[p.currentPosition] = [...(prev[p.currentPosition] || []), p.id]
        return prev
    }, {} as Record<number, string[]>)

    console.log("Be", spacesOccupied)

    return (
        <>
            {players.map((player) => {
                const playersOnSameSpace = spacesOccupied[player.currentPosition];
                const playerIndex = playersOnSameSpace.findIndex(p => p === player.id);
                const orientation = Math.floor(player.currentPosition / 10) % 2
                const isCurrentPlayer = player.id === players[currentPlayerIndex]?.id

                return (
                    <div
                        className="pawn absolute transition-all"
                        key={player.id}
                        style={{
                            top: monopolyBoardPositions[player.currentPosition].y + pawnOffsets[orientation][playerIndex].x,
                            left: monopolyBoardPositions[player.currentPosition].x + pawnOffsets[orientation][playerIndex].y,
                        }}
                    >
                        <div
                            className={classNames(
                                "absolute aspect-square rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md",
                                isCurrentPlayer ? "w-9 z-20" : "w-8"
                            )}
                            style={{
                                background: player.hexColor,
                            }}
                        >
                            {isCurrentPlayer && <div className="absolute rounded-full inset-0 animate-ping" style={{
                                background: player.hexColor
                            }}></div>}

                        </div>
                    </div>
                );
            })}
        </>
    )
}

export default PlayersPawnsRender

function generateMonopolyPositions(tileHeight: number, tileWidth: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];

    const propertiesPerSide = 9;
    // Corber is a square using tileHeight as a basis
    const cornerSize = tileHeight;

    // Calculate key coordinates once to simplify the logic inside the loops.
    const tileCenterOffset = tileWidth / 2;
    const nearEdgeCenter = cornerSize / 2;

    // The total width/height of the board's interactive area.
    const boardDimension = cornerSize * 2 + tileWidth * propertiesPerSide;
    const farEdgeCenter = boardDimension - nearEdgeCenter;

    // Side 1: Top Row (Indices 0-10)
    // Corner 0: GO
    positions.push({ x: nearEdgeCenter, y: nearEdgeCenter });
    for (let i = 1; i <= propertiesPerSide; i++) {
        const x = cornerSize + tileWidth * i - tileCenterOffset;
        positions.push({ x, y: nearEdgeCenter });
    }


    // Corner 10: Jail
    positions.push({ x: farEdgeCenter, y: nearEdgeCenter });
    // Side 2: Right Column (Indices 11-20)
    for (let i = 1; i <= propertiesPerSide; i++) {
        const y = cornerSize + tileWidth * i - tileCenterOffset;
        positions.push({ x: farEdgeCenter, y });
    }


    // Corner 20: Free Parking
    positions.push({ x: farEdgeCenter, y: farEdgeCenter });
    // Side 3: Bottom Row (Indices 21-30)
    for (let i = propertiesPerSide; i >= 1; i--) {
        const x = cornerSize + tileWidth * i - tileCenterOffset;
        positions.push({ x, y: farEdgeCenter });
    }


    // Corner 30: Go to Jail
    positions.push({ x: nearEdgeCenter, y: farEdgeCenter });
    // Side 4: Left Column (Indices 31-39)
    for (let i = propertiesPerSide; i >= 1; i--) {
        const y = cornerSize + tileWidth * i - tileCenterOffset;
        positions.push({ x: nearEdgeCenter, y });
    }

    return positions;
}