import { useState } from 'react'
import cn from "classnames"
import type { BoardSpace, CountrySpace, PropertySpace } from '@/types/BoardSpace'
import classNames from 'classnames'
import { Popover, type PopoverPosition } from 'react-tiny-popover'
import Button from '../atoms/Button'
import { RentStage } from '@/enums/RentStage'
import type { PlayersDict } from '@/types/Player'

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
                <div className="opacity-0">PHROLOVA</div>
                <div className={classNames("text-center font-bold py-2 absolute",
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



const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
</svg>

const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15A.75.75 0 0 0 15 9h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 19.5Z" clipRule="evenodd" />
</svg>


const MortgagedIcon = () =>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
    </svg>




export default Tile;
