import type { ColorGroup } from "@/enums/ColorGroup";
import type { RentStage } from "../enums/RentStage";
import type { SpecialSpaceType } from "./SpecialSpaceType";

export type BoardSpace =
  | GoSpace
  | CountrySpace
  | CommunityChestSpace
  | IncomeTaxSpace
  | RailroadSpace
  | ChanceSpace
  | JailSpace
  | UtilitySpace
  | FreeParkingSpace
  | GoToJailSpace
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

export interface PropertySpace extends Space {
  purchasePrice: number;
  mortgageValue: number;
  unmortgageCost: number;
  ownerId: string | null;
  isMortgaged: boolean;
}

export interface CountrySpace extends PropertySpace {
  $type: "country";
  group: ColorGroup;
  rentScheme: number[];
  houseCost: number;
  currentRentStage: RentStage;
}
interface RailroadSpace extends PropertySpace {
  $type: "railroad";
}
interface UtilitySpace extends PropertySpace {
  $type: "utility";
}

interface SpecialSpace extends Space {
  $type: "special";
  type: SpecialSpaceType;
}

interface CommunityChestSpace extends SpecialSpace {
  type: SpecialSpaceType.CommunityChest;
  id: string;
  name: "Community Chest";
  boardPosition: number;
}

interface IncomeTaxSpace extends SpecialSpace {
  type: SpecialSpaceType.IncomeTax;
  id: string;
  name: "Income Tax";
  boardPosition: number;
}

interface ChanceSpace extends SpecialSpace {
  type: SpecialSpaceType.Chance;
  id: string;
  name: "Chance";
  boardPosition: number;
}

interface JailSpace extends SpecialSpace {
  type: SpecialSpaceType.Jail;
  id: string;
  name: "Jail / Just Visiting";
  boardPosition: 10;
}

interface FreeParkingSpace extends SpecialSpace {
  type: SpecialSpaceType.FreeParking;
  id: string;
  name: "Free Parking";
  boardPosition: 20;
}

interface GoToJailSpace extends SpecialSpace {
  type: SpecialSpaceType.GoToJail;
  id: string;
  name: "Go To Jail";
  boardPosition: 30;
}

interface LuxuryTaxSpace extends SpecialSpace {
  type: SpecialSpaceType.LuxuryTax;
  id: string;
  name: "Luxury Tax";
  boardPosition: 38;
}
