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

/** Formata dígitos BR (DDD + número) para exibição em input. */
export function formatLocalPhoneDigits(raw: string | null | undefined): string {
  const d = digitsOnly(raw ?? "");
  if (!d) return "";
  if (d.length < 10) return d;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 8) {
    const part1 = rest.slice(0, 4);
    const part2 = rest.slice(4);
    return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
  }
  const part1 = rest.slice(0, 5);
  const part2 = rest.slice(5, 9);
  return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
}
