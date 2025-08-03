export type Trade = {
  id: string;
  initiatorId: string;
  recipientId: string;
  propertyOffer: string[];
  propertyCounterOffer: string[];
  moneyFromInitiator: number;
  moneyFromRecipient: number;
  approvalId: string;
};
