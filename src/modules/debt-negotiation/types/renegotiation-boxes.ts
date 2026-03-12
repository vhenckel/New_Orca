/** Um box retornado pela API de renegociação (formato do transformer no spot-api). */
export interface RenegotiationBoxItem {
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  percentage?: number;
}

export interface RenegotiationBoxesResponse {
  totalDebt: RenegotiationBoxItem;
  totalDebtOriginal?: RenegotiationBoxItem;
  totalNegotiated: RenegotiationBoxItem;
  totalRecoveredNegotiated: RenegotiationBoxItem;
  recoveryRate: Omit<RenegotiationBoxItem, "percentage">;
  negotiationRate?: Omit<RenegotiationBoxItem, "percentage">;
  averageTicket?: RenegotiationBoxItem;
  totalDebtCount: RenegotiationBoxItem;
  totalNegotiatedCount: RenegotiationBoxItem;
  totalRecoveredCount: RenegotiationBoxItem;
}

export interface RenegotiationBoxesParams {
  startDate: string;
  endDate: string;
  companyId: number;
}
