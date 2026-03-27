import { format, isValid, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

import type { AppLocale } from "@/shared/i18n/config";

function parseContactDate(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  const d = /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? parseISO(trimmed) : new Date(trimmed);
  return isValid(d) ? d : null;
}

/** Remove período após mês abreviado em pt-BR (ex.: "jan." → "jan"). */
function stripMonthAbbrevDot(rest: string): string {
  return rest.replace(/, (\p{L}+)\./u, ", $1");
}

/**
 * Data legível para colunas da lista de contatos (primeira conversa / última atualização).
 * pt-BR: "terça 01, jan 2026" · en-US: "Tue, Jun 15, 2026"
 */
export function formatContactListDate(
  iso: string | null | undefined,
  locale: AppLocale,
): string {
  if (iso == null || iso === "" || iso === "-") return "-";
  const d = parseContactDate(iso);
  if (!d) return "-";

  if (locale === "en-US") {
    return format(d, "EEE, MMM d, yyyy", { locale: enUS });
  }

  let weekday = format(d, "EEEE", { locale: ptBR });
  weekday = weekday.replace(/-feira$/u, "");
  let rest = format(d, "dd, MMM yyyy", { locale: ptBR });
  rest = stripMonthAbbrevDot(rest);
  return `${weekday} ${rest}`;
}

/**
 * Cabeçalho do detalhe do contato: primeira / última conversa.
 * pt-BR: "terça, 04 de março 2026 - 10:00" · en-US: "Tuesday, 04 March 2026 - 10:00"
 */
export function formatContactDetailConversationDate(
  iso: string | null | undefined,
  locale: AppLocale,
): string {
  if (iso == null || iso === "" || iso === "-") return "-";
  const d = parseContactDate(iso);
  if (!d) return "-";

  if (locale === "en-US") {
    return `${format(d, "EEEE, dd MMMM yyyy", { locale: enUS })} - ${format(d, "HH:mm", {
      locale: enUS,
    })}`;
  }

  let weekday = format(d, "EEEE", { locale: ptBR });
  weekday = weekday.replace(/-feira$/u, "").toLowerCase();
  const datePart = format(d, "dd 'de' MMMM yyyy", { locale: ptBR });
  const time = format(d, "HH:mm", { locale: ptBR });
  return `${weekday}, ${datePart} - ${time}`;
}
