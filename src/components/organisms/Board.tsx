import React, { useEffect, useLayoutEffect, useRef, type Ref } from 'react'
import Tile from '../molecules/Tile'

type Props = {}

const Board = (props: Props) => {
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
                <div className="top-left border aspect-square" style={{ height, blockSize: height }}></div>
                <div className="top row flex w-fit">
                    {Array(8).fill(true).map((e, i) => <Tile orientation='top' key={i} />)}
                </div>
                <div className="top-right border aspect-square" style={{ height, blockSize: height }}></div>

                <div className="left flex">
                    {Array(8).fill(true).map((e, i) => <Tile orientation='left' key={i} />)}
                </div>
                <div className="center"></div>
                <div className="right row flex ">
                    {Array(8).fill(true).map((e, i) => <Tile orientation='right' key={i} />)}
                </div>

                <div className="bottom-left border aspect-square" style={{ height, blockSize: height }}></div>
                <div className="bottom row flex w-fit">
                    {Array(8).fill(true).map((e, i) => <Tile orientation='bottom' key={i} />)}
                </div>
                <div className="bottom-right border aspect-square" style={{ height, blockSize: height }}></div>
            </div>
            {/* As a reference */}
            <div className="aspect-[21/34] fixed bottom-0 left-0 -z-50 w-fit border opacity-0" ref={tileRef}>PHROLOVA</div>
        </>
    )
}

export default Board