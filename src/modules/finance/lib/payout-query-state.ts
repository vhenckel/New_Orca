import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  throttle,
  useQueryState,
  useQueryStates,
} from "nuqs";

import type { PayoutStatus } from "@/modules/finance/types/payouts";

/** Lista de repasses: mês/ano + paginação compartilham a mesma query (nuqs). */
const payoutListReplaceOpts = { history: "replace" as const, scroll: false };

const payoutListQueryParsers = {
  payoutMonth: parseAsInteger
    .withDefault(new Date().getMonth() + 1)
    .withOptions(payoutListReplaceOpts),
  payoutYear: parseAsInteger
    .withDefault(new Date().getFullYear())
    .withOptions(payoutListReplaceOpts),
  payoutPage: parseAsInteger.withDefault(1).withOptions(payoutListReplaceOpts),
  payoutPageSize: parseAsInteger.withDefault(10).withOptions(payoutListReplaceOpts),
} as const;

const detailPaginationParsers = {
  payoutDetailPage: parseAsInteger.withDefault(1),
  payoutDetailPageSize: parseAsInteger.withDefault(10),
} as const;

export function usePayoutMonthYearQueryState() {
  const [raw, setRaw] = useQueryStates(payoutListQueryParsers);
  const month = raw.payoutMonth >= 1 && raw.payoutMonth <= 12 ? raw.payoutMonth : new Date().getMonth() + 1;
  const year = raw.payoutYear >= 2000 && raw.payoutYear <= 2100 ? raw.payoutYear : new Date().getFullYear();
  return {
    month,
    year,
    /** Atualiza URL (nuqs) e volta para página 1 — dispara refetch em `usePayoutList`. */
    setMonthYear: (next: { month: number; year: number }) =>
      setRaw({ payoutMonth: next.month, payoutYear: next.year, payoutPage: 1 }),
  };
}

export function usePayoutListPaginationQueryState() {
  const [raw, setRaw] = useQueryStates(payoutListQueryParsers);
  return {
    page: raw.payoutPage,
    pageSize: raw.payoutPageSize,
    setPagination: (next: { page?: number; pageSize?: number }) =>
      setRaw({
        payoutPage: next.page ?? raw.payoutPage,
        payoutPageSize: next.pageSize ?? raw.payoutPageSize,
      }),
  };
}

export function usePayoutDetailPaginationQueryState() {
  const [raw, setRaw] = useQueryStates(detailPaginationParsers);
  return {
    page: raw.payoutDetailPage,
    pageSize: raw.payoutDetailPageSize,
    setPagination: (next: { page?: number; pageSize?: number }) =>
      setRaw({
        payoutDetailPage: next.page ?? raw.payoutDetailPage,
        payoutDetailPageSize: next.pageSize ?? raw.payoutDetailPageSize,
      }),
  };
}

export function usePayoutStatusQueryState() {
  const [statuses, setStatuses] = useQueryState(
    "payoutStatuses",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({
      history: "replace",
      scroll: false,
      limitUrlUpdates: throttle(200),
    }),
  );
  const normalized = statuses.filter(
    (status): status is PayoutStatus =>
      status === "pending" || status === "paid" || status === "canceled",
  );
  return {
    statuses: normalized,
    setStatuses: (next: PayoutStatus[]) => setStatuses(next),
  };
}

export function usePayoutDetailSearchQueryState() {
  return useQueryState(
    "payoutQ",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      scroll: false,
      limitUrlUpdates: throttle(200),
    }),
  );
}
