export interface ContactDebtItem {
  totalAmount: number;
  status: string;
  updatedAt: string;
  installments: unknown[];
}

export type ContactDebtsResponse = ContactDebtItem[];

