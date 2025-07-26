import type { BoardSpace } from "./BoardSpace";
import type { Player } from "./Player";

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
};
