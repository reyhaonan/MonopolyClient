import React, { useEffect, type ReactNode } from 'react'
import Tile from '../molecules/Tile'
import type { BoardSpace } from '@/types/BoardSpace'
import phrolova from "@/assets/phrolova-ww.gif";

type Props = {
    board: { spaces: BoardSpace[] }
    startGameButton: ReactNode
    joinGameButton: ReactNode
    rollDiceButton: ReactNode
    endTurnButton: ReactNode
    tileHeight: number
}

const Board = ({ board, rollDiceButton, joinGameButton, startGameButton, endTurnButton, tileHeight }: Props) => {
    useEffect(() => {
        console.log(document.querySelector(".tile")?.getBoundingClientRect().height)
    }, [])

    return (
        <>

            <div className='w-fit h-fit grid board'>
                <div className="center flex items-center justify-center">
                    <img className="w-40 mx-auto col-span-2" src={phrolova} />
                    {startGameButton}
                    {joinGameButton}
                    {rollDiceButton}
                    {endTurnButton}
                </div>
                <div className="top-left aspect-square rounded-field bg-base-100" style={{ height: tileHeight, blockSize: tileHeight }}>
                    GO!
                </div>
                <div className="top row flex w-fit">
                    {board.spaces.slice(1, 10).map((space, i) =>
                        <Tile space={space} orientation='top' key={i} />
                    )}
                </div>
                <div className="top-right aspect-square rounded-field bg-base-100" style={{ height: tileHeight, blockSize: tileHeight }}>
                    JAIL
                </div>

                <div className="right row flex flex-row-reverse">
                    {board.spaces.slice(11, 20).map((space, i) =>
                        <Tile space={space} orientation='right' key={i} />
                    )}
                </div>

                <div className="bottom-right aspect-square rounded-field bg-base-100" style={{ height: tileHeight, blockSize: tileHeight }}>
                    PARK
                </div>

                <div className="bottom row flex w-fit flex-row-reverse">
                    {board.spaces.slice(21, 30).map((space, i) =>
                        <Tile space={space} orientation='bottom' key={i} />
                    )}
                </div>
                <div className="bottom-left aspect-square rounded-field bg-base-100" style={{ height: tileHeight, blockSize: tileHeight }}>
                    Go to Jail!
                </div>
                <div className="left flex flex-row-reverse">
                    {board.spaces.slice(31, 40).map((space, i) =>
                        <Tile space={space} orientation='left' key={i} />
                    )}
                </div>

            </div>
        </>
    )
}

export default Board