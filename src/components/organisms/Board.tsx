// components/organisms/tsx
import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RentStage } from '@/enums/RentStage';
import Tile from '../molecules/Tile';
import type { BoardSpace, CountrySpace } from '@/types/BoardSpace';
import phrolova from "@/assets/phrolova-ww.gif";

import type { ComponentProps } from 'react';
import type { ColorGroup } from '@/enums/ColorGroup';

// Define board layout constants to avoid magic numbers
const BOARD_LAYOUT = {
    TOP_ROW: { start: 1, end: 10 },
    RIGHT_ROW: { start: 11, end: 20 },
    BOTTOM_ROW: { start: 21, end: 30 },
    LEFT_ROW: { start: 31, end: 40 },
};

// Group related props into objects for better organization
type ActionButtons = {
    startGameButton: ReactNode;
    joinGameButton: ReactNode;
    rollDiceButton: ReactNode;
    endTurnButton: ReactNode;
    buyPropertyButton: ReactNode;
};

type Props = {
    spaces: BoardSpace[]
    actionButtons: ActionButtons;
    diceRoll: { roll1: number; roll2: number };
    tileWidth: number
    countryGroupDict: Record<ColorGroup, CountrySpace[]>
};

const Board = ({
    spaces,
    actionButtons,
    diceRoll,
    tileWidth,
    countryGroupDict,
    ...tileProps
}: Props & Pick<ComponentProps<typeof Tile>, "tileActions" | "isPermittedToBuyOrSellProperty" | "currentPlayerMoney" | "playersDict">) => {


    return (
        <div className='w-fit h-fit grid board'>
            {/* Center */}
            <div className="center gap-2 p-12 items-center justify-center relative aspect-square flex flex-col" style={{ width: tileWidth * 9 }}>
                <img className="w-40 absolute top-0 left-0" src={phrolova} alt="Monopoly center art" />
                <div className="roll flex gap-4 font-bold text-4xl">
                    <div className="dice1">{diceRoll.roll1}</div>
                    <div className="dice2">{diceRoll.roll2}</div>
                </div>
                {actionButtons.startGameButton}
                {actionButtons.joinGameButton}
                {actionButtons.rollDiceButton}
                {actionButtons.buyPropertyButton}
                {actionButtons.endTurnButton}
            </div>

            <div className="top-left corner rounded-field bg-base-100">GO!</div>
            <div className="top-right corner rounded-field bg-base-100">JAIL</div>
            <div className="bottom-right corner rounded-field bg-base-100">PARK</div>
            <div className="bottom-left corner rounded-field bg-base-100">Go to Jail!</div>

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
type TileProps = Omit<ComponentProps<typeof Tile>, 'space' | 'orientation' | 'playerIsGroupOwner' | 'groupHasHouse' | 'groupHasMortgagedProperty' | 'playerId' | 'isOwnedByPlayer'>;

type BoardRowProps = TileProps & {
    spaces: BoardSpace[];
    orientation: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    countryGroupDict: Record<ColorGroup, CountrySpace[]>
};
const BoardRow = ({ spaces, orientation, className, countryGroupDict, ...tileProps }: BoardRowProps) => {
    const playerId = useAuth();


    return (
        <div className={`row flex ${className}`}>
            {spaces.map((space) => {
                const isOwnedByPlayer = space.$type !== "special" && space.ownerId === playerId;

                return (
                    <Tile
                        key={space.id}
                        space={space}
                        orientation={orientation}
                        // now when i say player, i mean THE player, not another player
                        isOwnedByPlayer={isOwnedByPlayer}
                        playerIsGroupOwner={space.$type === "country" && countryGroupDict[space.group].every(c => c.ownerId === playerId)}
                        groupHasHouse={space.$type === "country" && countryGroupDict[space.group].some(c => c.currentRentStage > RentStage.Unimproved)}
                        groupHasMortgagedProperty={space.$type === "country" && countryGroupDict[space.group].some(c => c.isMortgaged)}
                        {...tileProps} />
                );
            })}
        </div>
    );
};