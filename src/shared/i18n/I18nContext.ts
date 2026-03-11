import { createContext } from "react";

import type { AppLocale, TranslationKey } from "@/shared/i18n/config";

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
