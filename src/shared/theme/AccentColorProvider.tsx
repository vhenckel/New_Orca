import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AccentColorContext } from "@/shared/theme/AccentColorContext";
import {
  accentColorStorageKey,
  applyAccentColor,
  defaultAccentColor,
  getStoredAccentColor,
  sanitizeAccentColor,
} from "@/shared/theme/accent-color";

export function AccentColorProvider({ children }: PropsWithChildren) {
  const [accentColor, setAccentColorState] = useState(defaultAccentColor);

  useEffect(() => {
    const storedAccentColor = getStoredAccentColor();
    setAccentColorState(storedAccentColor);
    applyAccentColor(storedAccentColor);
  }, []);

  const setAccentColor = useCallback((nextColor: string) => {
    const sanitizedColor = sanitizeAccentColor(nextColor);
    setAccentColorState(sanitizedColor);
    window.localStorage.setItem(accentColorStorageKey, sanitizedColor);
    applyAccentColor(sanitizedColor);
  }, []);

  const value = useMemo(
    () => ({
      accentColor,
      setAccentColor,
    }),
    [accentColor, setAccentColor],
  );

  return <AccentColorContext.Provider value={value}>{children}</AccentColorContext.Provider>;
}
