const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Interpreta `YYYY-MM-DD` como meia-noite no fuso local. */
export function parseLocalDateInput(value: string): Date | null {
  const match = DATE_INPUT_PATTERN.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function startOfTomorrowLocal(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
}

/** Converte ISO para valor de `input type="date"` no fuso local. */
export function isoToDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Serializa `YYYY-MM-DD` para ISO usando meio-dia local (evita shift de timezone). */
export function localDateInputToIso(value: string): string | null {
  const date = parseLocalDateInput(value);
  if (!date) return null;
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}
