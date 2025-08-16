import React, { useState, type Ref } from 'react'
import cn from "classnames"
import type { BoardSpace } from '@/types/BoardSpace'
import classNames from 'classnames'
import { ArrowContainer, Popover, type PopoverPosition } from 'react-tiny-popover'
import Button from '../atoms/Button'
import { useAuth } from '@/hooks/useAuth'
import { RentStage } from '@/enums/RentStage'
import { ColorGroup } from '@/enums/ColorGroup'

type Props = {
    orientation: "top" | "bottom" | "left" | "right",
    space: BoardSpace
    isPermittedToBuyOrSellProperty: boolean
    tileActions: TileActions,
    playerIsGroupOwner: boolean,
    groupHasHouse: boolean,
    groupHasMortgagedProperty: boolean,
    isOwnedByPlayer: boolean,
    currentPlayerMoney: number
}

type TileActions = {
    upgradeProperty: (id: string) => void;
    downgradeProperty: (id: string) => void;
    mortgageProperty: (id: string) => void;
    unmortgageProperty: (id: string) => void;
    sellProperty: (id: string) => void;
}


const Tile = ({
    orientation,
    space,
    isPermittedToBuyOrSellProperty,
    tileActions,
    playerIsGroupOwner,
    groupHasHouse,
    groupHasMortgagedProperty,
    isOwnedByPlayer,
    currentPlayerMoney
}: Props) => {

    if (space.$type === "special") return <div
        className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-200 select-none'}>
        <div className="opacity-0">PHROLOVA</div>
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
                    <h3 className="text-2xl font-semibold mb-2">
                        {space.name}
                    </h3>

                    {space.$type === "country" ?
                        <div className='space-y-1'>
                            {space.rentScheme.map((rent, i) =>
                                <div className='flex items-center justify-between' key={i}>
                                    <p className='text-sm opacity-60'>{i === 0 ? "Rent only" : i !== 5 ? `${i} House` : "Hotel"}</p>
                                    <p>${rent}</p>
                                </div>
                            )}
                        </div>
                        : space.$type === "railroad" ?
                            <div className='space-y-1'>
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
                    {isOwnedByPlayer && isPermittedToBuyOrSellProperty &&
                        <div className="property-options flex gap-2 mb-4">
                            {space.$type === "country" && <>
                                <Button
                                    className='btn btn-sm btn-square btn-primary'
                                    disabled={groupHasMortgagedProperty || space.currentRentStage === RentStage.Hotel || currentPlayerMoney < space.houseCost}
                                    onClick={() => tileActions.upgradeProperty(space.id)}
                                >
                                    Bu
                                </Button>
                                <Button
                                    className='btn btn-sm btn-square btn-primary'
                                    onClick={() => tileActions.downgradeProperty(space.id)}
                                    disabled={space.currentRentStage === RentStage.Unimproved}
                                >
                                    Se
                                </Button>
                            </>}
                            {space.isMortgaged ?
                                <Button
                                    className='btn btn-sm btn-square btn-primary ml-auto'
                                    onClick={() => tileActions.unmortgageProperty(space.id)}
                                    disabled={currentPlayerMoney < space.unmortgageCost}
                                >
                                    UM
                                </Button> :
                                <Button
                                    className='btn btn-sm btn-square btn-primary ml-auto'
                                    onClick={() => tileActions.mortgageProperty(space.id)}
                                    disabled={groupHasHouse}
                                >
                                    M
                                </Button>
                            }
                            <Button
                                className='btn btn-sm btn-square btn-primary'
                                disabled={groupHasHouse}
                                onClick={() => tileActions.sellProperty(space.id)}
                            >
                                $$
                            </Button>
                        </div>}
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
            {/* TILE */}
            <div
                role="button" tabIndex={0}
                onClick={() => setIsPopoverOpen(true)}
                className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-200 select-none cursor-pointer'}
            >
                <div className="opacity-0">PHROLOVA</div>
                <div className={classNames("text-center font-bold py-2 absolute",
                    orientation === "top" || orientation === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
                )}>
                    {space.name}
                </div>
                <div className="text-xs opacity-40 m-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

                    {space.boardPosition}
                    <br />
                    {playerIsGroupOwner ? "Yea" : "Na"}
                    <br />
                    {space.$type === "country" && RentStage[space.currentRentStage]}
                </div>

                <div className={cn("rounded-field text-center text-sm font-semibold py-2")}>{space.ownerId?.substring(0, 6) || `$${space.purchasePrice}`}</div>
            </div>
        </Popover>
    );
};

export default Tile;
