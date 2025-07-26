export type Player = {
  id: string;
  name: string;
  money: number;
  currentPosition: number;
  isInJail: boolean;
  jailTurnsRemaining: number;
  getOutOfJailFreeCards: number;
  consecutiveDoubles: number;
  propertiesOwned: string[];
  isBankrupt: boolean;
};
