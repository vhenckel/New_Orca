import { useContext } from "react";

import { AccentColorContext } from "@/shared/theme/AccentColorContext";

export function useAccentColor() {
  const context = useContext(AccentColorContext);

  if (!context) {
    throw new Error("useAccentColor must be used within AccentColorProvider.");
  }

  return context;
}
