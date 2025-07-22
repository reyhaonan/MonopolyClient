declare type GameState = {
  gameId: string;
  players: Player[];
  activePlayers: Player[];
  board: Board;
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
  propertiesOwned: any[]; // You might want to define a 'Property' type if properties have a specific structure
  isBankrupt: boolean;
};

type Board = {
  spaces: Space[];
};

type Space = {
  id: string;
  name: string;
  boardPosition: number;
};
