import type { BoardSpace } from "./BoardSpace";
import type { Player } from "./Player";
import type { Trade } from "./Trade";
import type { TransactionInfo } from "./TransactionInfo";

export type GameState = {
  gameId: string;
  activePlayers: Player[];
  board: {
    spaces: BoardSpace[];
  };
  currentPlayerIndex: number;
  totalDiceRoll: number;
  currentPhase: number;
  transactionsHistory: {
    history: TransactionInfo[];
  };
  activeTrades: Trade[];
};
