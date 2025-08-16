import React, { type Ref } from 'react'
import cn from "classnames"
import type { BoardSpace } from '@/types/BoardSpace'

type Props = {
    ref?: Ref<HTMLDivElement>,
    orientation: "top" | "bottom" | "left" | "right",
    space: BoardSpace
}

const Tile = ({ ref, orientation, space }: Props) => {
    return (
        <div
            className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100'}
            ref={ref}>
            {space.$type === "country" && <div className={"text-center font-bold absolute p-1"}>
                {space.name}
            </div>}
            <div className="opacity-0">PHROLOVA</div>
            <div className="text-xs opacity-40 m-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{space.boardPosition}</div>

            {space.$type === "country" &&
                <div className={cn("rounded-field text-center py-2")}>$69</div>
            }
        </div>
    )
}

export default Tile