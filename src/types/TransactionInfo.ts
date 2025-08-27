import type { TransactionType } from "../enums/TransactionType";

export type TransactionInfo = {
  senderId: string | null;
  receiverId: string | null;
  amount: number;
  isTransactionWithBank: boolean;
  transactionType: TransactionType;
};
