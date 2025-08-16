import { useEffect, type ReactNode } from 'react'
import Tile from '../molecules/Tile'
import type { BoardSpace } from '@/types/BoardSpace'
import phrolova from "@/assets/phrolova-ww.gif";
import { useAuth } from '@/hooks/useAuth';

type Props = {
    board: { spaces: BoardSpace[] }
    startGameButton: ReactNode
    joinGameButton: ReactNode
    rollDiceButton: ReactNode
    endTurnButton: ReactNode
    buyPropertyButton: ReactNode

    tileHeight: number

    diceRoll1: number
    diceRoll2: number

    isPermittedToBuyOrSellProperty: boolean

    upgradeProperty: (id: string) => void,
    downgradeProperty: (id: string) => void,
    mortgageProperty: (id: string) => void,
    unmortgageProperty: (id: string) => void,
    sellProperty: (id: string) => void,
}

const Board = ({
    isPermittedToBuyOrSellProperty,
    board,
    rollDiceButton,
    joinGameButton,
    startGameButton,
    endTurnButton,
    buyPropertyButton,
    tileHeight,
    diceRoll1,
    diceRoll2,
    ...tileProps
}: Props) => {


    const playerId = useAuth()

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
                    {buyPropertyButton}
                    {endTurnButton}
                </div>
                <div
                    className="top-left aspect-square rounded-field bg-base-200 flex items-center justify-center text-2xl font-bold"
                    style={{ height: tileHeight, blockSize: tileHeight }}>
                    GO!
                </div>
                <div className="top row flex w-fit">
                    {board.spaces.slice(1, 10).map((space, i) =>
                        <Tile
                            isPermittedToBuyOrSellProperty={isPermittedToBuyOrSellProperty}
                            space={space}
                            orientation='top'
                            key={i}
                            {...tileProps}
                        />
                    )}
                </div>
                <div
                    className="top-right aspect-square rounded-field bg-base-200 flex items-center justify-center text-2xl font-bold"
                    style={{ height: tileHeight, blockSize: tileHeight }}>
                    JAIL
                </div>

                <div className="right row flex flex-row-reverse">
                    {board.spaces.slice(11, 20).map((space, i) =>
                        <Tile
                            isPermittedToBuyOrSellProperty={isPermittedToBuyOrSellProperty}
                            space={space}
                            orientation='right'
                            key={i}
                            {...tileProps}
                        />
                    )}
                </div>

                <div
                    className="bottom-right aspect-square rounded-field bg-base-200 flex items-center justify-center text-2xl font-bold"
                    style={{ height: tileHeight, blockSize: tileHeight }}>
                    PARK
                </div>

                <div className="bottom row flex w-fit flex-row-reverse">
                    {board.spaces.slice(21, 30).map((space, i) =>
                        <Tile
                            isPermittedToBuyOrSellProperty={isPermittedToBuyOrSellProperty}
                            space={space}
                            orientation='bottom'
                            key={i}
                            {...tileProps}
                        />
                    )}
                </div>
                <div
                    className="bottom-left aspect-square rounded-field bg-base-200 flex items-center justify-center text-2xl font-bold"
                    style={{ height: tileHeight, blockSize: tileHeight }}>
                    Go to Jail!
                </div>
                <div className="left flex flex-row-reverse">
                    {board.spaces.slice(31, 40).map((space, i) =>
                        <Tile
                            isPermittedToBuyOrSellProperty={isPermittedToBuyOrSellProperty}
                            space={space}
                            orientation='left'
                            key={i}
                            {...tileProps}
                        />
                    )}
                </div>

            </div>
        </>
    )
}

export default Board