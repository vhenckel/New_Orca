export interface NpsDailyTrendItem {
  day: string;
  value: number | null;
}

export interface NpsMonthlyTrendItem {
  month?: string;
  value?: number | null;
}

export interface RenegotiationNpsResponse {
  currentScore: number;
  detractor: number;
  neutral: number;
  promoter: number;
  monthlyTrend: NpsMonthlyTrendItem[];
  dailyTrend: NpsDailyTrendItem[];
}

export interface RenegotiationNpsParams {
  startDate: string;
  endDate: string;
  companyId: number;
}
