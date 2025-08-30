import type { PropertySpace } from "./BoardSpace";

export type Trade = {
  id: string;
  initiatorId: string;
  recipientId: string;
  propertyOffer: string[];
  propertyCounterOffer: string[];
  moneyFromInitiator: number;
  moneyFromRecipient: number;
  getOutOfJailCardFromInitiator: number;
  getOutOfJailCardFromRecipient: number;
  negotiateCount: number;
};

export type TradeOffer = {
  offer: PropertySpace["id"][];
  counterOffer: PropertySpace["id"][];
  moneyFromInitiator: number;
  moneyFromRecipient: number;
  getOutOfJailCardFromInitiator: number[];
  getOutOfJailCardFromRecipient: number[];
};
