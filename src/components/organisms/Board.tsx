import React, { useEffect, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react'
import Tile from '../molecules/Tile'
import type { BoardSpace } from '@/types/BoardSpace'

type Props = {
    board: { spaces: BoardSpace[] }
    startGameButton: ReactNode
    joinGameButton: ReactNode
    rollDiceButton: ReactNode
    endTurnButton: ReactNode
}

const Board = ({ board, rollDiceButton, joinGameButton, startGameButton, endTurnButton }: Props) => {
    useEffect(() => {
        console.log(document.querySelector(".tile")?.getBoundingClientRect().height)
    }, [])

    const [height, setHeight] = React.useState(0)

    // https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs
    // const measuredRef = React.useCallback((node: HTMLDivElement) => {

    //     if (node !== null) {
    //         setHeight(node.getBoundingClientRect().height)
    //     }

    // }, [])

    const tileRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        function updateSize() {
            setHeight(tileRef.current?.getBoundingClientRect().height || 160);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return (
        <>
            <div className='w-fit h-fit grid board'>
                <div className="center flex items-center justify-center">
                    {startGameButton}
                    {joinGameButton}
                    {rollDiceButton}
                    {endTurnButton}
                </div>
                <div className="top-left aspect-square rounded-field bg-base-100" style={{ height, blockSize: height }}>
                    GO!
                </div>
                <div className="top row flex w-fit">
                    {board.spaces.slice(1, 10).map((space, i) =>
                        <Tile space={space} orientation='top' key={i} />
                    )}
                </div>
                <div className="top-right aspect-square rounded-field bg-base-100" style={{ height, blockSize: height }}>
                    JAIL
                </div>

                <div className="right row flex flex-row-reverse">
                    {board.spaces.slice(11, 20).map((space, i) =>
                        <Tile space={space} orientation='right' key={i} />
                    )}
                </div>

                <div className="bottom-right aspect-square rounded-field bg-base-100" style={{ height, blockSize: height }}>
                    PARK
                </div>

                <div className="bottom row flex w-fit flex-row-reverse">
                    {board.spaces.slice(21, 30).map((space, i) =>
                        <Tile space={space} orientation='bottom' key={i} />
                    )}
                </div>
                <div className="bottom-left aspect-square rounded-field bg-base-100" style={{ height, blockSize: height }}>
                    Go to Jail!
                </div>
                <div className="left flex flex-row-reverse">
                    {board.spaces.slice(31, 40).map((space, i) =>
                        <Tile space={space} orientation='left' key={i} />
                    )}
                </div>

            </div>
            {/* As a reference */}
            <div className="aspect-[21/34] fixed bottom-0 left-0 -z-50 w-fit opacity-0" ref={tileRef}>PHROLOVA</div>
        </>
    )
}

export default Board