import type { ChanceOutcome } from "./ChanceOutcome";

export type ChanceCard = {
  chanceOutcome: ChanceOutcome;
  moveAdded: number;
  monetaryAmount: number;
  propertyDestination: number;
  flavorText: string;
};
