import { baseEnUS } from "@/shared/i18n/messages/base/en-US";
import { basePtBR } from "@/shared/i18n/messages/base/pt-BR";
import { collectionsEnUS } from "@/modules/collections/i18n/en-US";
import { collectionsPtBR } from "@/modules/collections/i18n/pt-BR";
import { configEnUS } from "@/modules/config/i18n/en-US";
import { configPtBR } from "@/modules/config/i18n/pt-BR";
import { contactEnUS } from "@/modules/contact/i18n/en-US";
import { contactPtBR } from "@/modules/contact/i18n/pt-BR";
import { debtNegotiationEnUS } from "@/modules/debt-negotiation/i18n/en-US";
import { debtNegotiationPtBR } from "@/modules/debt-negotiation/i18n/pt-BR";
import { financeEnUS } from "@/modules/finance/i18n/en-US";
import { financePtBR } from "@/modules/finance/i18n/pt-BR";
import { salesEnUS } from "@/modules/sales/i18n/en-US";
import { salesPtBR } from "@/modules/sales/i18n/pt-BR";
import { settingsEnUS } from "@/modules/settings/i18n/en-US";
import { settingsPtBR } from "@/modules/settings/i18n/pt-BR";

export const localeStorageKey = "o2ospot-locale";
export const defaultLocale = "pt-BR";

const ptBRMessages = {
  ...basePtBR,
  ...contactPtBR,
  ...debtNegotiationPtBR,
  ...financePtBR,
  ...collectionsPtBR,
  ...salesPtBR,
  ...settingsPtBR,
  ...configPtBR,
} as const;

const enUSMessages = {
  ...baseEnUS,
  ...contactEnUS,
  ...debtNegotiationEnUS,
  ...financeEnUS,
  ...collectionsEnUS,
  ...salesEnUS,
  ...settingsEnUS,
  ...configEnUS,
} as const;

export const appMessages = {
  "pt-BR": ptBRMessages,
  "en-US": enUSMessages,
} as const;

export type AppLocale = keyof typeof appMessages;
export type TranslationKey = keyof typeof ptBRMessages;
