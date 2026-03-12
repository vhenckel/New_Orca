/**
 * Parsers e defaults para filtros na URL (nuqs). Use em useQueryState/useQueryStates.
 * Padrão: todos os filtros que afetam listagens/dashboards vão para a query string.
 */
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";

/** Formato esperado: YYYY-MM-DD. */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(s: string | null): s is string {
  return typeof s === "string" && ISO_DATE_REGEX.test(s);
}

/** Retorna o primeiro dia do mês atual e hoje em YYYY-MM-DD. */
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

/** Parsers para período (dashboard renegociação, etc.). */
export const dateRangeParsers = {
  startDate: parseAsString.withDefault(""),
  endDate: parseAsString.withDefault(""),
} as const;

/** Hook: startDate e endDate na URL. Retorna valores da URL se válidos (YYYY-MM-DD), senão o default do mês. */
export function useDateRangeQueryState() {
  const [params, setParams] = useQueryStates(dateRangeParsers);
  const defaultRange = getDefaultDateRange();
  const startDate = isValidIsoDate(params.startDate) ? params.startDate : defaultRange.startDate;
  const endDate = isValidIsoDate(params.endDate) ? params.endDate : defaultRange.endDate;
  return {
    startDate,
    endDate,
    setDateRange: (range: { startDate: string; endDate: string }) =>
      setParams({ startDate: range.startDate, endDate: range.endDate }),
    /** Valores brutos da URL (podem ser vazios). */
    raw: params,
  };
}

/** Parser para página (listagens). */
export const pageParser = parseAsInteger.withDefault(1);

/** Parser para companyId quando vier da URL (ex.: debug). Multi-tenant: normalmente vem do auth. */
export const companyIdParser = parseAsInteger.withDefault(0);

/** Valores aceitos para exibição dos dados diários e do gráfico de performance (mesma API). */
export type DetailsShowValues = "quantity" | "value";

const showValuesParser = parseAsString.withDefault("quantity");

/** Hook: visão "Quantidade" ou "Valor (R$)" para gráfico de performance e tabela diária (query string). */
export function useDetailsShowValues(): [
  DetailsShowValues,
  (value: DetailsShowValues) => void,
] {
  const [raw, setRaw] = useQueryState("showValues", showValuesParser);
  const showValues: DetailsShowValues = raw === "value" ? "value" : "quantity";
  return [showValues, setRaw as (value: DetailsShowValues) => void];
}
