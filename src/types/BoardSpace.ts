import type { RentStage } from "../enums/RentStage";

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

interface CountrySpace {
  $type: "country";
  group: number;
  rentScheme: number[];
  houseCost: number;
  purchasePrice: number;
  mortgageValue: number;
  ownerId: string | null;
  isMortgaged: boolean;
  currentRentStage: RentStage;
  id: string;
  name: string;
  boardPosition: number;
}

interface CommunityChestSpace {
  $type: "special";
  type: 4;
  id: string;
  name: "Community Chest";
  boardPosition: number;
}

interface IncomeTaxSpace {
  $type: "special";
  type: 6;
  id: string;
  name: "Income Tax";
  boardPosition: number;
}

interface RailroadSpace {
  $type: "railroad";
  purchasePrice: number;
  mortgageValue: number;
  ownerId: string | null;
  isMortgaged: boolean;
  id: string;
  name: string;
  boardPosition: number;
}

interface ChanceSpace {
  $type: "special";
  type: 5;
  id: string;
  name: "Chance";
  boardPosition: number;
}

interface JailSpace {
  $type: "special";
  type: 8;
  id: string;
  name: "Jail / Just Visiting";
  boardPosition: 10;
}

interface UtilitySpace {
  $type: "utility";
  purchasePrice: number;
  mortgageValue: number;
  ownerId: string | null;
  isMortgaged: boolean;
  id: string;
  name: string;
  boardPosition: number;
}

interface FreeParkingSpace {
  $type: "special";
  type: 10;
  id: string;
  name: "Free Parking";
  boardPosition: 20;
}

interface GoToJailSpace {
  $type: "special";
  type: 9;
  id: string;
  name: "Go To Jail";
  boardPosition: 30;
}

interface LuxuryTaxSpace {
  $type: "special";
  type: 7;
  id: string;
  name: "Luxury Tax";
  boardPosition: 38;
}
