/** Dígitos apenas (para normalização BR / appkey). */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Appkey E.164 BR → DDD+número (10–11 dígitos), sem prefixo 55. */
export function appkeyToLocalDigits(appkey: string | null | undefined): string {
  if (!appkey) return "";
  const d = digitsOnly(appkey);
  if (d.startsWith("55") && d.length >= 12) return d.slice(2);
  return d;
}

/** DDD+número ou dígitos completos → appkey com prefixo 55. */
export function localDigitsToAppkey(localDigits: string): string {
  const d = digitsOnly(localDigits);
  if (!d) return "";
  return d.startsWith("55") ? d : `55${d}`;
}
