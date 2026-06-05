import { ORCA_ORANGE } from "@/shared/theme/brand-colors";

export const accentColorStorageKey = "orca-accent-color";
export const accentColorUserChoiceKey = "orca-accent-user-customized";
export const defaultAccentColor = ORCA_ORANGE;

/** Cores legadas aplicadas automaticamente (não são escolha do usuário). */
const LEGACY_AUTO_COLORS = new Set(["#6467f2", "#096dd9", "#6366f1"]);

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHexColor(value: string) {
  if (!/^#([0-9a-f]{6})$/i.test(value)) {
    return defaultAccentColor;
  }

  return value.toLowerCase();
}

function hexToRgb(hex: string): RgbColor {
  const normalizedHex = normalizeHexColor(hex).replace("#", "");

  return {
    r: Number.parseInt(normalizedHex.slice(0, 2), 16),
    g: Number.parseInt(normalizedHex.slice(2, 4), 16),
    b: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    switch (max) {
      case normalizedR:
        h = 60 * (((normalizedG - normalizedB) / delta) % 6);
        break;
      case normalizedG:
        h = 60 * ((normalizedB - normalizedR) / delta + 2);
        break;
      default:
        h = 60 * ((normalizedR - normalizedG) / delta + 4);
        break;
    }
  }

  return {
    h: Math.round(h < 0 ? h + 360 : h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function toCssHsl(color: HslColor) {
  return `${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%`;
}

function withLightness(color: HslColor, lightness: number): HslColor {
  return {
    ...color,
    l: clamp(lightness, 0, 100),
  };
}

function getForegroundColor(color: HslColor) {
  return color.l >= 62 ? "222 47% 11%" : "0 0% 100%";
}

export function hasUserChosenAccentColor() {
  return window.localStorage.getItem(accentColorUserChoiceKey) === "true";
}

/** Remove cores antigas salvas automaticamente (ex.: branding azul do mock). */
export function migrateLegacyAccentStorage() {
  if (hasUserChosenAccentColor()) return;

  const stored = window.localStorage.getItem(accentColorStorageKey);
  if (!stored) return;

  if (LEGACY_AUTO_COLORS.has(normalizeHexColor(stored))) {
    window.localStorage.removeItem(accentColorStorageKey);
  }
}

/** Cor efetiva: laranja padrão, exceto se o usuário personalizou nas preferências. */
export function getEffectiveAccentColor() {
  migrateLegacyAccentStorage();

  if (!hasUserChosenAccentColor()) {
    return defaultAccentColor;
  }

  const stored = window.localStorage.getItem(accentColorStorageKey);
  return stored ? normalizeHexColor(stored) : defaultAccentColor;
}

export function applyAccentColor(hexColor: string) {
  const root = document.documentElement;
  const accentColor = rgbToHsl(hexToRgb(hexColor));

  const lighterOne = withLightness(accentColor, accentColor.l + 12);
  const lighterTwo = withLightness(accentColor, accentColor.l + 22);
  const lighterThree = withLightness(accentColor, accentColor.l + 30);

  const primaryHover = withLightness(accentColor, Math.max(accentColor.l - 6, 0));

  root.style.setProperty("--primary", toCssHsl(accentColor));
  root.style.setProperty("--primary-hover", toCssHsl(primaryHover));
  root.style.setProperty("--primary-foreground", getForegroundColor(accentColor));
  root.style.setProperty("--ring", toCssHsl(accentColor));
  root.style.setProperty("--sidebar-primary", toCssHsl(accentColor));
  root.style.setProperty("--sidebar-primary-foreground", getForegroundColor(accentColor));
  root.style.setProperty("--sidebar-ring", toCssHsl(accentColor));
  root.style.setProperty("--chart-1", toCssHsl(accentColor));
  root.style.setProperty("--chart-2", toCssHsl(lighterOne));
  root.style.setProperty("--chart-3", toCssHsl(lighterTwo));
  root.style.setProperty("--chart-4", toCssHsl(lighterThree));
}

export function persistUserAccentColor(hexColor: string) {
  const sanitized = normalizeHexColor(hexColor);
  window.localStorage.setItem(accentColorUserChoiceKey, "true");
  window.localStorage.setItem(accentColorStorageKey, sanitized);
  applyAccentColor(sanitized);
  return sanitized;
}

/** @deprecated Use getEffectiveAccentColor */
export function getStoredAccentColor() {
  return getEffectiveAccentColor();
}

export function sanitizeAccentColor(value: string) {
  return normalizeHexColor(value);
}

export function resetAccentColor() {
  window.localStorage.removeItem(accentColorUserChoiceKey);
  window.localStorage.removeItem(accentColorStorageKey);
  applyAccentColor(defaultAccentColor);
  return defaultAccentColor;
}

export function isDefaultAccentColor(color: string) {
  return !hasUserChosenAccentColor() || normalizeHexColor(color) === defaultAccentColor;
}
