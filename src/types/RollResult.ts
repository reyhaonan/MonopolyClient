import type { GamePhase } from "@/enums/GamePhase";
import type { TransactionInfo } from "./TransactionInfo";
import type { ChanceCard } from "./ChanceCard";
import type { TreasureCard } from "./TreasureCard";

export type RollResult = {
  dice: DiceInfo;
  playerState: PlayerStateInfo;
  transaction: TransactionInfo[];
  newGamePhase: GamePhase;
  chanceCardsDrawn: { [key: number]: ChanceCard };
  treasureCardsDrawn: { [key: number]: TreasureCard };
};

interface DiceInfo {
  roll1: number;
  roll2: number;
  totalRoll: number;
}

interface PlayerStateInfo {
  isInJail: boolean;
  newPlayerPosition: number;
  newPlayerJailTurnsRemaining: number;
  consecutiveDoubles: number;
}
