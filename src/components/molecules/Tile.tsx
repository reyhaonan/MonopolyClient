import { useState } from 'react'
import cn from "classnames"
import type { BoardSpace, CountrySpace, PropertySpace } from '@/types/BoardSpace'
import classNames from 'classnames'
import { Popover, type PopoverPosition } from 'react-tiny-popover'
import Button from '../atoms/Button'
import { RentStage } from '@/enums/RentStage'
import type { PlayersDict } from '@/types/Player'
import HomeIcon from '../atoms/icons/HomeIcon'
import HotelIcon from '../atoms/icons/HotelIcon'
import MortgagedIcon from '../atoms/icons/MortgagedIcon'

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
    playersDict: PlayersDict
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
    currentPlayerMoney,
    playersDict,
}: Props) => {

    if (space.$type === "special") return <div
        className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100 select-none'}>
        <div className="opacity-0 text-sm">PHROLOVA</div>
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
            containerClassName='z-30'
            content={() => (
                <div tabIndex={0}
                    className="select-none w-52 bg-base-100 p-4 rounded-box"
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
                                    disabled={!playerIsGroupOwner || groupHasMortgagedProperty || space.currentRentStage === RentStage.Hotel || currentPlayerMoney < space.houseCost}
                                    onClick={() => tileActions.upgradeProperty(space.id)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path fillRule="evenodd" d="M11.47 10.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 12.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M11.47 4.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 6.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                                    </svg>

                                </Button>
                                <Button
                                    className='btn btn-sm btn-square btn-primary'
                                    onClick={() => tileActions.downgradeProperty(space.id)}
                                    disabled={!playerIsGroupOwner || space.currentRentStage === RentStage.Unimproved}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path fillRule="evenodd" d="M11.47 13.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 11.69 5.03 4.72a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M11.47 19.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 1 0-1.06-1.06L12 17.69l-6.97-6.97a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clipRule="evenodd" />
                                    </svg>

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
                className={'relative tile w-fit flex flex-col justify-between rounded-field bg-base-100 select-none cursor-pointer'}
            >
                <div className="opacity-0 text-sm">PHROLOVA</div>
                <div className={classNames("text-center font-bold py-2 absolute text-sm",
                    orientation === "top" || orientation === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
                )}>
                    {space.name}
                </div>
                {/* <div className="text-xs opacity-40 m-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

                    {space.boardPosition}
                    <br />
                    {playerIsGroupOwner ? "Yea" : "Na"}
                    <br />
                    {space.$type === "country" && RentStage[space.currentRentStage]}
                </div> */}

                <div className={cn("rounded-field flex items-center justify-center text-center text-sm font-semibold",
                    orientation === "top" || orientation === "bottom" ? "h-1/4" : "w-1/4"
                )}

                    style={{
                        background: space.ownerId ? playersDict[space.ownerId].hexColor : undefined
                    }}
                >{renderSpaceInfo(space)}</div>
            </div>
        </Popover>
    );
};

const renderSpaceInfo = (space: PropertySpace) => {
    if (!space.ownerId) return <>${space.purchasePrice}</>;
    if (space.isMortgaged) return <div className='text-neutral-content flex items-center'><MortgagedIcon /></div>;
    if (space.$type === "country") {
        const countrySpace = space as CountrySpace
        switch (countrySpace.currentRentStage) {
            case RentStage.OneHouse:
            case RentStage.TwoHouse:
            case RentStage.ThreeHouse:
            case RentStage.FourHouse:
                return <div className='text-neutral-content flex items-center'><HomeIcon />x{countrySpace.currentRentStage}</div>
            case RentStage.Hotel:
                return <div className='text-neutral-content flex items-center'><HotelIcon /></div>
            default:
                return <>&nbsp;</>
        }
    }
    return <>&nbsp;</>;
};





export default Tile;
