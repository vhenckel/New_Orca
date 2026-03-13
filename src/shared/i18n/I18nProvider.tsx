import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  appMessages,
  defaultLocale,
  localeStorageKey,
  type AppLocale,
  type TranslationKey,
} from "@/shared/i18n/config";
import { I18nContext } from "@/shared/i18n/I18nContext";

function isAppLocale(value: string | null): value is AppLocale {
  return value === "pt-BR" || value === "en-US";
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    if (isAppLocale(storedLocale)) {
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const raw =
        appMessages[locale][key] ?? appMessages[defaultLocale][key] ?? key;
      if (!vars || typeof raw !== "string") return raw;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
        raw,
      );
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
