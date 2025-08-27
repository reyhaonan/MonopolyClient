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
  hexColor: string;
};

export type PlayerWithProperties = {
  propertiesOwned: PropertySpace[];
} & Omit<Player, "propertiesOwned">;

export type PlayersDict = { [key: Player["id"]]: Player };
