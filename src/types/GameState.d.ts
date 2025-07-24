declare type GameState = {
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

type Space = {
  id: string;
  name: string;
  boardPosition: number;
};
