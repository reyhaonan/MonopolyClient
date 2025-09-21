import type { TreasureOutcome } from "./TreasureOutcome";

export type TreasureCard = {
  treasureOutcome: TreasureOutcome;
  moveAdded: number;
  monetaryAmount: number;
  propertyDestination: number;
  flavorText: string;
};
