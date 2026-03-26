/** Formata appkey / número bruto para exibição estilo +55 (DDD) nnnnn-nnnn. */
export function formatWhatsApp(raw: string | null | undefined): string {
  if (!raw) return "-";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return raw;
  const ddd = digits.slice(-11, -9);
  const rest = digits.slice(-9);
  const part1 = rest.slice(0, 5);
  const part2 = rest.slice(5);
  return `+55 (${ddd}) ${part1}-${part2}`;
}
