import React, { useState, type Ref } from 'react'
import cn from "classnames"
import type { BoardSpace } from '@/types/BoardSpace'
import classNames from 'classnames'
import { ArrowContainer, Popover, type PopoverPosition } from 'react-tiny-popover'

type Props = {
    orientation: "top" | "bottom" | "left" | "right",
    space: BoardSpace
}


const Tile = ({ orientation, space }: Props) => {

    if (space.$type === "special") return <div
        className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100 select-none'}>
        <div className="opacity-0">PHROLOVA</div>
        <div className="text-xs opacity-40 m-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{space.boardPosition}</div>
    </div>

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const getPopoverPosition = (): PopoverPosition[] => {
        switch (orientation) {
            case "top":
                return ["bottom"]
            case "bottom":
                return ["top"]
            case "left":
                return ["right"]
            case "right":
                return ["left"]
        }
    }

    return (
        <Popover
            isOpen={isPopoverOpen}
            positions={getPopoverPosition()}
            onClickOutside={() => setIsPopoverOpen(false)}
            padding={10}
            content={() => (
                <div tabIndex={0}
                    className="select-none z-20 w-52 bg-base-100 p-4 shadow rounded-box"
                    style={{
                        writingMode: "horizontal-tb"
                    }}>
                    <h3 className="text-2xl font-semibold text-center mb-2">
                        {space.name}
                    </h3>

                    {space.$type === "country" ?
                        <div className='space-y-2'>
                            {space.rentScheme.map((rent, i) =>
                                <div className='flex items-center justify-between' key={i}>
                                    <p className='text-sm opacity-60'>{i === 0 ? "Rent only" : i !== 5 ? `${i} House` : "Hotel"}</p>
                                    <p>${rent}</p>
                                </div>
                            )}
                        </div>
                        : space.$type === "railroad" ?
                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm opacity-60'>1 station</p>
                                    <p>$25</p>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm opacity-60'>2 stations</p>
                                    <p>$50</p>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm opacity-60'>3 stations</p>
                                    <p>$100</p>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm opacity-60'>4 stations</p>
                                    <p>$200</p>
                                </div>
                            </div>
                            : <></>
                    }

                    <div className="divider my-2"></div>

                    <div className="flex justify-around">
                        <div className="flex flex-col items-center">
                            <p className='text-xs opacity-40'>Price</p>
                            <p>${space.purchasePrice}</p>
                        </div>
                        {space.$type === "country" && <>
                            <div className="flex flex-col items-center">
                                <p className='text-xs opacity-40'>House</p>
                                <p>${space.houseCost}</p>
                            </div>
                        </>}
                    </div>
                </div>
            )}>

            <div
                role="button" tabIndex={0}
                onClick={() => setIsPopoverOpen(true)}
                className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100 select-none cursor-pointer'}
            >
                <div className="opacity-0">PHROLOVA</div>
                <div className={classNames("text-center font-bold py-2 absolute",
                    orientation === "top" || orientation === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
                )}>
                    {orientation}
                </div>
                <div className="text-xs opacity-40 m-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{space.boardPosition}</div>

                <div className={cn("rounded-field text-center text-sm font-semibold py-2")}>$69</div>
            </div>
        </Popover >
    )
}

export default Tile