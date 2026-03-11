export const accentColorStorageKey = "o2ospot-accent-color";
export const defaultAccentColor = "#6467f2";

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

export function applyAccentColor(hexColor: string) {
  const root = document.documentElement;
  const accentColor = rgbToHsl(hexToRgb(hexColor));

  const lighterOne = withLightness(accentColor, accentColor.l + 12);
  const lighterTwo = withLightness(accentColor, accentColor.l + 22);
  const lighterThree = withLightness(accentColor, accentColor.l + 30);

  root.style.setProperty("--primary", toCssHsl(accentColor));
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

export function getStoredAccentColor() {
  const storedValue = window.localStorage.getItem(accentColorStorageKey);
  return normalizeHexColor(storedValue ?? defaultAccentColor);
}

export function sanitizeAccentColor(value: string) {
  return normalizeHexColor(value);
}
