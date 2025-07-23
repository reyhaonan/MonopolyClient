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

type Player = {
  id: string;
  name: string;
  money: number;
  currentPosition: number;
  isInJail: boolean;
  jailTurnsRemaining: number;
  getOutOfJailFreeCards: number;
  consecutiveDoubles: number;
  isBankrupt: boolean;
};

type Space = {
  id: string;
  name: string;
  boardPosition: number;
};
