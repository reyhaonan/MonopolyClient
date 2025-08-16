import type { Player } from '@/types/Player'
import React, { useEffect, useMemo, useState } from 'react'

type Props = {
    players: Player[]
    tileHeight: number
    tileWidth: number
}


const PlayersPawns = ({ players, tileHeight, tileWidth }: Props) => {
    const monopolyBoardPositions = useMemo(() => generateMonopolyPositions(tileHeight, tileWidth), [tileHeight, tileWidth])

    return (
        <>
            {players.map(((player, i) =>
                <div className="pawn absolute" key={player.id}
                    style={{
                        top: monopolyBoardPositions[player.currentPosition].y,
                        left: monopolyBoardPositions[player.currentPosition].x,
                    }}
                >
                    <div className="absolute w-8 h-8 rounded-full bg-purple-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                </div>
            ))}
        </>
    )
}

export default PlayersPawns

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