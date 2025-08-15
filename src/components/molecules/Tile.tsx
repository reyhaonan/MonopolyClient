import React, { type Ref } from 'react'
import cn from "classnames"

type Props = {
    ref?: Ref<HTMLDivElement>,
    orientation: "top" | "bottom" | "left" | "right",
}

const Tile = ({ ref, orientation }: Props) => {
    return (
        <div
            className={'relative tile w-fit border'}
            ref={ref}>
            <div className={"absolute top-0 left-0"}>
                Country
            </div>
            <div className="opacity-0">PHROLOVA</div>

            <div className="bg-base-200 rounded-field text-center">$69</div>
        </div>
    )
}

export default Tile