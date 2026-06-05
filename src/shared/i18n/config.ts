import { baseEnUS } from "@/shared/i18n/messages/base/en-US";
import { basePtBR } from "@/shared/i18n/messages/base/pt-BR";
import { analyticEnUS } from "@/modules/buyer/analytic/i18n/en-US";
import { analyticPtBR } from "@/modules/buyer/analytic/i18n/pt-BR";
import { dashboardEnUS } from "@/modules/buyer/dashboard/i18n/en-US";
import { dashboardPtBR } from "@/modules/buyer/dashboard/i18n/pt-BR";
import { productEnUS } from "@/modules/product/i18n/en-US";
import { productPtBR } from "@/modules/product/i18n/pt-BR";
import { quotationEnUS } from "@/modules/buyer/quotation/i18n/en-US";
import { quotationPtBR } from "@/modules/buyer/quotation/i18n/pt-BR";
import { supplierEnUS as buyerSupplierEnUS } from "@/modules/buyer/supplier/i18n/en-US";
import { supplierPtBR as buyerSupplierPtBR } from "@/modules/buyer/supplier/i18n/pt-BR";
import { adminEnUS } from "@/modules/admin/i18n/en-US";
import { adminPtBR } from "@/modules/admin/i18n/pt-BR";
import { supplierPortalEnUS } from "@/modules/supplier/i18n/en-US";
import { supplierPortalPtBR } from "@/modules/supplier/i18n/pt-BR";

export const localeStorageKey = "orca-locale";
export const defaultLocale = "pt-BR";

const ptBRMessages = {
  ...basePtBR,
  ...dashboardPtBR,
  ...quotationPtBR,
  ...productPtBR,
  ...buyerSupplierPtBR,
  ...analyticPtBR,
  ...supplierPortalPtBR,
  ...adminPtBR,
} as const;

const enUSMessages = {
  ...baseEnUS,
  ...dashboardEnUS,
  ...quotationEnUS,
  ...productEnUS,
  ...buyerSupplierEnUS,
  ...analyticEnUS,
  ...supplierPortalEnUS,
  ...adminEnUS,
} as const;

export const appMessages = {
  "pt-BR": ptBRMessages,
  "en-US": enUSMessages,
} as const;

export type AppLocale = keyof typeof appMessages;
export type TranslationKey = keyof typeof ptBRMessages;
