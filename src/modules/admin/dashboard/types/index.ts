import type { LucideIcon } from "lucide-react";

export type TrendTone = "positive" | "negative";

export interface AdminPlanSummary {
  label: string;
  value: string;
}

export interface AdminKpiItem {
  label: string;
  value: string;
  variation: string;
  variationTone: TrendTone;
  icon: LucideIcon;
  highlighted?: boolean;
}

export interface MrrEvolutionPoint {
  month: string;
  mrr: number;
  newRevenue: number;
  churn: number;
}

export interface BillingForecast {
  nextMonth: { label: string; value: string; change: string };
  nextQuarter: { label: string; value: string };
  nextYear: { label: string; value: string };
  averageTicket: string;
  estimatedLtv: string;
}

export interface BaseGrowthPoint {
  month: string;
  restaurants: number;
  suppliers: number;
}

export interface QuotationActivityPoint {
  week: string;
  created: number;
  responded: number;
}

export interface RestaurantStatusItem {
  status: string;
  count: number;
  color: string;
}

export interface TopCityItem {
  city: string;
  count: number;
}

export type RegistrationType = "restaurant" | "supplier";

export interface RecentRegistration {
  id: string;
  name: string;
  location: string;
  type: RegistrationType;
  registeredAt: string;
}

export type AlertTone = "danger" | "info" | "warning";

export interface OperationalAlert {
  id: string;
  message: string;
  tone: AlertTone;
  icon: LucideIcon;
}
