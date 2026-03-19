export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type KpiItem = {
  title: string;
  value: number | string;
  previousValue?: number;
  percentageChange?: number;
  isQuantity?: boolean;
  /** Destaque visual do valor (ex.: total em primary). */
  valueVariant?: "primary" | "default";
};
