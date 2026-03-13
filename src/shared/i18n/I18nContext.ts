import { createContext } from "react";

import type { AppLocale, TranslationKey } from "@/shared/i18n/config";

export type TranslationVars = Record<string, string | number>;

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, vars?: TranslationVars) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
