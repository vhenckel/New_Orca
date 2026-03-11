import { createContext } from "react";

interface AccentColorContextValue {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export const AccentColorContext = createContext<AccentColorContextValue | null>(null);
