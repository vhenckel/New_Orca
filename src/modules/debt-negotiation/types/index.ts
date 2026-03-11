export interface PortfolioBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface KpiMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  percentage?: string;
  delay?: number;
}

export interface OperationalMetric {
  label: string;
  value: string;
  subtitle?: string;
  delay?: number;
}
