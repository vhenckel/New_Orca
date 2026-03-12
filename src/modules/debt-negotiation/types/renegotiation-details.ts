/** Uma linha de dados diários da API /trinity/analytics/renegotiation/view/details. Valores vêm como string. */
export interface RenegotiationDailyRow {
  date: string;
  registeredDebts: string;
  inCharge: string;
  inNegotiation: string;
  negotiated: string;
  negotiatedWithoutPayment: string;
  recovered: string;
  ignored: string;
  canceled: string;
}

export interface RenegotiationDetailsResponse {
  values: RenegotiationDailyRow[];
}

export interface RenegotiationDetailsParams {
  startDate: string;
  endDate: string;
  companyId: number;
  viewType?: "daily";
  showValues?: "quantity" | "value";
}
