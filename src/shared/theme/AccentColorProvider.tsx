import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AccentColorContext } from "@/shared/theme/AccentColorContext";
import {
  defaultAccentColor,
  getEffectiveAccentColor,
  isDefaultAccentColor,
  persistUserAccentColor,
  resetAccentColor as resetAccentColorValue,
  sanitizeAccentColor,
} from "@/shared/theme/accent-color";

export function AccentColorProvider({ children }: PropsWithChildren) {
  const [accentColor, setAccentColorState] = useState(defaultAccentColor);

  const syncAccentFromStorage = useCallback(() => {
    const effective = getEffectiveAccentColor();
    setAccentColorState(effective);
    return effective;
  }, []);

  useEffect(() => {
    syncAccentFromStorage();
  }, [syncAccentFromStorage]);

  const setAccentColor = useCallback((nextColor: string) => {
    const sanitizedColor = sanitizeAccentColor(nextColor);
    setAccentColorState(sanitizedColor);
    persistUserAccentColor(sanitizedColor);
  }, []);

  const resetAccentColor = useCallback(() => {
    const restored = resetAccentColorValue();
    setAccentColorState(restored);
  }, []);

  const value = useMemo(
    () => ({
      accentColor,
      setAccentColor,
      resetAccentColor,
      isDefaultAccent: isDefaultAccentColor(accentColor),
    }),
    [accentColor, setAccentColor, resetAccentColor],
  );

  return <AccentColorContext.Provider value={value}>{children}</AccentColorContext.Provider>;
}
