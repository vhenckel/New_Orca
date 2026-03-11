import { enUSMessages } from "@/shared/i18n/messages/en-US";
import { ptBRMessages } from "@/shared/i18n/messages/pt-BR";

export const localeStorageKey = "o2ospot-locale";
export const defaultLocale = "pt-BR";

export const appMessages = {
  "pt-BR": ptBRMessages,
  "en-US": enUSMessages,
} as const;

export type AppLocale = keyof typeof appMessages;
export type TranslationKey = keyof typeof ptBRMessages;
