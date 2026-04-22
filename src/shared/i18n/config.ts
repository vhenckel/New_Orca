import { baseEnUS } from "@/shared/i18n/messages/base/en-US";
import { basePtBR } from "@/shared/i18n/messages/base/pt-BR";
import { analyticEnUS } from "@/modules/analytic/i18n/en-US";
import { analyticPtBR } from "@/modules/analytic/i18n/pt-BR";
import { configEnUS } from "@/modules/config/i18n/en-US";
import { configPtBR } from "@/modules/config/i18n/pt-BR";
import { dashboardEnUS } from "@/modules/dashboard/i18n/en-US";
import { dashboardPtBR } from "@/modules/dashboard/i18n/pt-BR";
import { productEnUS } from "@/modules/product/i18n/en-US";
import { productPtBR } from "@/modules/product/i18n/pt-BR";
import { quotationEnUS } from "@/modules/quotation/i18n/en-US";
import { quotationPtBR } from "@/modules/quotation/i18n/pt-BR";
import { supplierEnUS } from "@/modules/supplier/i18n/en-US";
import { supplierPtBR } from "@/modules/supplier/i18n/pt-BR";

export const localeStorageKey = "orca-locale";
export const defaultLocale = "pt-BR";

const ptBRMessages = {
  ...basePtBR,
  ...dashboardPtBR,
  ...quotationPtBR,
  ...productPtBR,
  ...supplierPtBR,
  ...analyticPtBR,
  ...configPtBR,
} as const;

const enUSMessages = {
  ...baseEnUS,
  ...dashboardEnUS,
  ...quotationEnUS,
  ...productEnUS,
  ...supplierEnUS,
  ...analyticEnUS,
  ...configEnUS,
} as const;

export const appMessages = {
  "pt-BR": ptBRMessages,
  "en-US": enUSMessages,
} as const;

export type AppLocale = keyof typeof appMessages;
export type TranslationKey = keyof typeof ptBRMessages;
