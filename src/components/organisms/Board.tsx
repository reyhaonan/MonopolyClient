import { useEffect, type ReactNode } from 'react'
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

    diceRoll1: number
    diceRoll2: number
}

const Board = ({
    board,
    rollDiceButton,
    joinGameButton,
    startGameButton,
    endTurnButton,
    tileHeight,
    diceRoll1,
    diceRoll2
}: Props) => {
    useEffect(() => {
        console.log(document.querySelector(".tile")?.getBoundingClientRect().height)
    }, [])

    return (
        <>

            <div className='w-fit h-fit grid board'>
                <div className="center flex flex-col gap-2 items-center justify-center">
                    <div className="roll flex gap-4 font-bold text-4xl">
                        <div className="dice1">
                            {diceRoll1}
                        </div>
                        <div className="dice2">
                            {diceRoll2}
                        </div>
                    </div>
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