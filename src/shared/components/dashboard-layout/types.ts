import type { TranslationKey } from "@/shared/i18n/config";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

/** Atalho: primeiro segmento = módulo (traduzido + link), segundo = título da página. */
export type ModulePageBreadcrumb = {
  moduleTitleKey: TranslationKey;
  moduleHref: string;
  pageTitle: string;
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
