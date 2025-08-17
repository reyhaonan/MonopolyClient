import type { GamePhase } from "@/enums/GamePhase";
import type { TransactionInfo } from "./TransactionInfo";

export type RollResult = {
  dice: DiceInfo;
  playerState: PlayerStateInfo;
  transaction: TransactionInfo[];
  newGamePhase: GamePhase;
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
