import type { ColorGroup } from "@/enums/ColorGroup";
import type { RentStage } from "../enums/RentStage";
import type { SpecialSpaceType } from "./SpecialSpaceType";

export type BoardSpace =
  | GoSpace
  | CountryProperty
  | CommunityChestSpace
  | IncomeTaxSpace
  | RailroadProperty
  | ChanceSpace
  | UtilityProperty
  | LuxuryTaxSpace;

interface GoSpace {
  $type: "special";
  type: 3;
  id: string;
  name: "GO!";
  boardPosition: 0;
}

export interface Space {
  id: string;
  name: string;
  boardPosition: number;
}

interface Property extends Space {
  purchasePrice: number;
  mortgageValue: number;
  unmortgageCost: number;
  ownerId: string | null;
  isMortgaged: boolean;
}

export interface CountryProperty extends Property {
  $type: "country";
  group: ColorGroup;
  rentScheme: number[];
  houseCost: number;
  currentRentStage: RentStage;
}
export interface RailroadProperty extends Property {
  $type: "railroad";
}
export interface UtilityProperty extends Property {
  $type: "utility";
}

export type PropertySpace = CountryProperty | RailroadProperty | UtilityProperty;

export interface SpecialSpace extends Space {
  $type: "special";
  type: SpecialSpaceType;
}

interface CommunityChestSpace extends SpecialSpace {
  type: SpecialSpaceType.CommunityChest;
  name: "Community Chest";
}

interface IncomeTaxSpace extends SpecialSpace {
  type: SpecialSpaceType.IncomeTax;
  name: "Income Tax";
}

interface ChanceSpace extends SpecialSpace {
  type: SpecialSpaceType.Chance;
  name: "Chance";
}

interface LuxuryTaxSpace extends SpecialSpace {
  type: SpecialSpaceType.LuxuryTax;
  name: "Luxury Tax";
}
