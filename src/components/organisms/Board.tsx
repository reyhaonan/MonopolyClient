// components/organisms/tsx
import { type ReactNode } from 'react';
import PropertyTile from '../molecules/PropertyTile';
import type { BoardSpace, CountryProperty } from '@/types/BoardSpace';

import type { ComponentProps } from 'react';
import type { ColorGroup } from '@/enums/ColorGroup';
import SpecialTile from '../molecules/SpecialTile';
import { SpecialSpaceType } from '@/types/SpecialSpaceType';


const BOARD_LAYOUT = {
    TOP_ROW: { start: 1, end: 10 }, // 1-9
    RIGHT_ROW: { start: 11, end: 20 }, // 11-19
    BOTTOM_ROW: { start: 21, end: 30 },// 21-29
    LEFT_ROW: { start: 31, end: 40 },// 31-39
};

type ActionButtons = {
    startGameButton: ReactNode;
    joinGameButton: ReactNode;
    rollDiceButton: ReactNode;
    endTurnButton: ReactNode;
    buyPropertyButton: ReactNode;
    payToGetOutOfJailButton: ReactNode;
    useGetOutOfJailCardButton: ReactNode;
};

type Props = {
    spaces: BoardSpace[]
    actionButtons: ActionButtons;
    diceRoll: { roll1: number; roll2: number };
    tileWidth: number
    countryGroupDict: Record<ColorGroup, CountryProperty[]>
};

const Board = ({
    spaces,
    actionButtons,
    diceRoll,
    tileWidth,
    countryGroupDict,
    ...tileProps
}: Props & Pick<ComponentProps<typeof BoardRow>, "chancePopovers" | "treasurePopovers"> & Pick<ComponentProps<typeof PropertyTile>, "tileActions" | "isPermittedToBuyOrSellProperty" | "currentPlayerMoney" | "playersDict">) => {


    return (
        <div className='w-fit h-fit grid board'>
            {/* Center */}
            <div className="center gap-2 p-12 items-center justify-center relative aspect-square flex flex-col" style={{ width: tileWidth * 9 }}>
                {!!diceRoll.roll2 && !!diceRoll.roll1 && <div className="roll flex gap-4 font-bold text-4xl">
                    <div className="dice1">{diceRoll.roll1}</div>
                    <div className="dice2">{diceRoll.roll2}</div>
                </div>}
                {actionButtons.joinGameButton}
                {actionButtons.startGameButton}
                <div className="jailOption flex gap-2">
                    {actionButtons.payToGetOutOfJailButton}
                    {actionButtons.useGetOutOfJailCardButton}
                </div>
                <div className="propertyOption flex gap-2">
                    {actionButtons.buyPropertyButton}
                    {actionButtons.rollDiceButton}
                </div>
                {actionButtons.endTurnButton}
            </div>

            <div className="top-left corner rounded-field bg-base-100 text-3xl font-bold flex items-center justify-center">GO!!</div>
            <div className="top-right corner rounded-field bg-base-100 text-xl font-bold flex">
                <div className="jail bg-base-200 p-2 mt-auto aspect-square h-2/3 flex items-center justify-center">
                    JAIL
                </div>
            </div>
            <div className="bottom-right corner rounded-field bg-base-100 text-xl font-bold flex items-center justify-center">Free park</div>
            <div className="bottom-left corner rounded-field bg-base-100 text-xl font-bold flex items-center justify-center">Go to Jail!</div>

            <BoardRow
                countryGroupDict={countryGroupDict}
                orientation='top'
                spaces={spaces.slice(BOARD_LAYOUT.TOP_ROW.start, BOARD_LAYOUT.TOP_ROW.end)}
                className='w-fit top'
                {...tileProps}
            />
            <BoardRow
                countryGroupDict={countryGroupDict}
                orientation='right'
                spaces={spaces.slice(BOARD_LAYOUT.RIGHT_ROW.start, BOARD_LAYOUT.RIGHT_ROW.end)}
                className='flex-row-reverse right'
                {...tileProps}
            />
            <BoardRow
                countryGroupDict={countryGroupDict}
                orientation='bottom'
                spaces={spaces.slice(BOARD_LAYOUT.BOTTOM_ROW.start, BOARD_LAYOUT.BOTTOM_ROW.end)}
                className='w-fit flex-row-reverse bottom'
                {...tileProps}
            />
            <BoardRow
                countryGroupDict={countryGroupDict}
                orientation='left'
                spaces={spaces.slice(BOARD_LAYOUT.LEFT_ROW.start, BOARD_LAYOUT.LEFT_ROW.end)}
                className='flex-row-reverse left'
                {...tileProps}
            />
        </div>
    );
};

export default Board;

// Get the props required by the Tile component, but omit 'space' and 'orientation'
// as the BoardRow will manage these itself.
type TileProps = Omit<ComponentProps<typeof PropertyTile>, 'space' | 'orientation' | 'playerIsGroupOwner' | 'groupHasHouse' | 'groupHasMortgagedProperty' | 'playerId' | 'isOwnedByPlayer'>;

type BoardRowProps = TileProps & {
    spaces: BoardSpace[];
    orientation: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    countryGroupDict: Record<ColorGroup, CountryProperty[]>

    chancePopovers: Map<number, string>,
    treasurePopovers: Map<number, string>
};
const BoardRow = ({ spaces, orientation, className, countryGroupDict, chancePopovers, treasurePopovers, ...tileProps }: BoardRowProps) => {
    return (
        <div className={`row flex ${className}`}>
            {spaces.map((space) => {
                if (space.$type === "special") return <SpecialTile
                    popoverMessage={space.type == SpecialSpaceType.Chance ? chancePopovers.get(space.boardPosition) : space.type == SpecialSpaceType.Treasure ? treasurePopovers.get(space.boardPosition) : undefined}
                    space={space}
                    orientation={orientation} />
                return (
                    <PropertyTile
                        key={space.id}
                        space={space}
                        orientation={orientation}
                        group={space.$type === "country" ? countryGroupDict[space.group] : undefined}
                        {...tileProps} />
                );
            })}
        </div>
    );
};