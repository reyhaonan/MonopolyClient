import type { BoardSpace } from "./BoardSpace";
import type { Player } from "./Player";
import type { TransactionInfo } from "./TransactionInfo";

export type GameState = {
  gameId: string;
  players: Player[];
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
};
