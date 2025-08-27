export type GameConfig = {
  maxPlayers: number;
  minPlayers: number;
  freeParkingPot: boolean;
  doubleBaseRentOnFullColorSet: boolean;
  allowCollectRentOnJail: boolean;
  allowMortgagingProperties: boolean;
  balancedHousePurchase: boolean;
  auctionOnNoPurchase: boolean;
  jailFine: number;
  incomeTax: number;
  luxuryTax: number;
  startingMoney: number;
};

export const gameConfigInitial: GameConfig = {
  maxPlayers: 8,
  minPlayers: 2,
  jailFine: 50,
  luxuryTax: 100,
  incomeTax: 200,
  freeParkingPot: false,
  doubleBaseRentOnFullColorSet: false,
  allowCollectRentOnJail: true,
  allowMortgagingProperties: true,
  balancedHousePurchase: true,
  startingMoney: 1500,
  auctionOnNoPurchase: false,
};
