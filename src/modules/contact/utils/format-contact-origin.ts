/**
 * API GET /contact/:id/details devolve `origin` como string ou objeto (ContactOrigin + originOption).
 */
export function formatContactOriginLabel(origin: unknown): string {
  if (origin == null) return "";
  if (typeof origin === "string") return origin.trim();
  if (typeof origin === "object" && origin !== null) {
    const o = origin as { originOption?: { name?: string }; name?: string };
    const label = o.originOption?.name ?? o.name;
    if (typeof label === "string") return label.trim();
  }
  return "";
}
