import { baseEnUS } from "@/shared/i18n/messages/base/en-US";
import { basePtBR } from "@/shared/i18n/messages/base/pt-BR";
import { configEnUS } from "@/modules/config/i18n/en-US";
import { configPtBR } from "@/modules/config/i18n/pt-BR";
import { quotationEnUS } from "@/modules/quotation/i18n/en-US";
import { quotationPtBR } from "@/modules/quotation/i18n/pt-BR";

export const localeStorageKey = "orca-locale";
export const defaultLocale = "pt-BR";

const ptBRMessages = {
  ...basePtBR,
  ...configPtBR,
  ...quotationPtBR,
} as const;

const enUSMessages = {
  ...baseEnUS,
  ...configEnUS,
  ...quotationEnUS,
} as const;

export const appMessages = {
  "pt-BR": ptBRMessages,
  "en-US": enUSMessages,
} as const;

export type AppLocale = keyof typeof appMessages;
export type TranslationKey = keyof typeof ptBRMessages;
