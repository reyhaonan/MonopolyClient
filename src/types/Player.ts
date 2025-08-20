import type { PropertySpace } from "./BoardSpace";

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

export type PlayerWithProperties = {
  propertiesOwned: PropertySpace[];
} & Omit<Player, "propertiesOwned">;
