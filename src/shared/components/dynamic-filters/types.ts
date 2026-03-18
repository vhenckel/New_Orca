import type React from "react";

export enum FilterType {
  MULTISELECT = "multiselect",
  RANGE_NUMBER = "range_number",
  RANGE_CURRENCY = "range_currency",
  RANGE_DATE = "range_date",
  SEARCH = "search",
}

export type FilterOptionValue = string | number;

export interface FilterOption {
  value: FilterOptionValue;
  label: string;
  [key: string]: unknown;
}

export interface RenderLabelParams {
  label: string;
  value: FilterOptionValue;
  [key: string]: unknown;
}

export interface RenderBadgeParams {
  label: string;
  value: FilterOptionValue;
  [key: string]: unknown;
}

export type LoadFilterOptionsResult =
  | FilterOption[]
  | {
      options: FilterOption[];
      hasMore?: boolean;
    };

export type LoadFilterOptions = (args: {
  searchTerm: string;
  page: number;
  pageSize: number;
}) => Promise<LoadFilterOptionsResult>;

export interface FilterConfig {
  id: string;
  type: FilterType;
  label: string;
  searchable?: boolean;
  options?: FilterOption[];
  min?: number;
  max?: number;
  loadOptions?: LoadFilterOptions;
  loadOptionsOnMount?: boolean;
  paramKey?: string | string[];
  useLabels?: boolean;
  renderLabel?: (params: RenderLabelParams) => React.ReactNode;
  renderBadge?: (params: RenderBadgeParams) => React.ReactNode;
}

export interface AppliedFilter {
  id: string;
  values: unknown[];
}

