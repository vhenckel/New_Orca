/**
 * Parsers e defaults para filtros na URL (nuqs). Use em useQueryState/useQueryStates.
 * Padrão: todos os filtros que afetam listagens/dashboards vão para a query string.
 */
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  throttle,
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

/**
 * Período na query string (`?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`).
 * Usado no módulo Renegociação: dashboard, Dívidas, drill-downs (renegotiation / negotiated / recovered).
 */
export const dateRangeParsers = {
  startDate: parseAsString.withDefault(""),
  endDate: parseAsString.withDefault(""),
} as const;

/** Alias semântico — mesmos parsers que `dateRangeParsers`. */
export const debtNegotiationDateRangeParsers = dateRangeParsers;

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

/** Mesmo comportamento que `useDateRangeQueryState` — nome explícito para telas de renegociação. */
export function useDebtNegotiationDateRangeQueryState() {
  return useDateRangeQueryState();
}

/** Monta path com `startDate` e `endDate` na query (navegação dashboard ↔ drill-down). */
export function debtNegotiationPathWithDateRange(
  pathname: string,
  range: { startDate: string; endDate: string },
): string {
  const q = new URLSearchParams({
    startDate: range.startDate,
    endDate: range.endDate,
  });
  return `${pathname}?${q.toString()}`;
}

/** Parser para página (listagens). */
export const pageParser = parseAsInteger.withDefault(1);

export { companyIdParser } from "@/shared/lib/company-id-parser";

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

const ALLOWED_PAGE_SIZES = [10, 20, 50, 100] as const;

/** Parsers para paginação de tabelas na URL. */
export const paginationParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
} as const;

function normalizePageSize(value: number): (typeof ALLOWED_PAGE_SIZES)[number] {
  if (ALLOWED_PAGE_SIZES.includes(value as (typeof ALLOWED_PAGE_SIZES)[number])) {
    return value as (typeof ALLOWED_PAGE_SIZES)[number];
  }
  return 10;
}

function normalizePage(page: number): number {
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
}

/**
 * Hook: página e tamanho da página na query string (DataTable).
 * pageSize só aceita 10, 20, 50 ou 100; valores inválidos viram 10.
 */
export function usePaginationQueryState() {
  const [params, setParams] = useQueryStates(paginationParsers);
  const pageSize = normalizePageSize(params.pageSize);
  const page = normalizePage(params.page);

  const setPage = (next: number) => {
    setParams({ page: normalizePage(next) });
  };

  const setPageSize = (next: number) => {
    const size = normalizePageSize(next);
    setParams({ pageSize: size, page: 1 });
  };

  /** skip/take para APIs estilo management (O2OTable). */
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return {
    page,
    pageSize,
    skip,
    take,
    setPage,
    setPageSize,
    setPagination: (u: { page?: number; pageSize?: number }) => {
      const nextSize = u.pageSize !== undefined ? normalizePageSize(u.pageSize) : pageSize;
      const nextPage =
        u.page !== undefined
          ? normalizePage(u.page)
          : u.pageSize !== undefined
            ? 1
            : page;
      setParams({
        page: nextPage,
        pageSize: nextSize,
      });
    },
    raw: params,
  };
}

const debtsPaginationParsers = {
  debtsPage: parseAsInteger.withDefault(1),
  debtsPageSize: parseAsInteger.withDefault(10),
} as const;

/** Paginação na URL para listagem de dívidas (`debtsPage`, `debtsPageSize`). */
export function useDebtsPaginationQueryState() {
  const [params, setParams] = useQueryStates(debtsPaginationParsers);
  const pageSize = normalizePageSize(params.debtsPageSize);
  const page = normalizePage(params.debtsPage);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    setPagination: (u: { page?: number; pageSize?: number }) => {
      const nextSize =
        u.pageSize !== undefined ? normalizePageSize(u.pageSize) : pageSize;
      const nextPage =
        u.page !== undefined
          ? normalizePage(u.page)
          : u.pageSize !== undefined
            ? 1
            : page;
      setParams({ debtsPage: nextPage, debtsPageSize: nextSize });
    },
    raw: params,
  };
}

const contactsBlocklistPaginationParsers = {
  contactsBlPage: parseAsInteger.withDefault(1),
  contactsBlPageSize: parseAsInteger.withDefault(10),
  contactsBlQ: parseAsString.withDefault("").withOptions({
    history: "replace",
    scroll: false,
    limitUrlUpdates: throttle(200),
  }),
} as const;

type SortDirection = "ASC" | "DESC";

function normalizeSortDirection(raw: string | null | undefined, fallback: SortDirection): SortDirection {
  if (raw === "ASC" || raw === "DESC") return raw;
  return fallback;
}

const contactsSortParsers = {
  contactsOrderBy: parseAsString.withDefault("updatedAt"),
  contactsOrderDir: parseAsString.withDefault("DESC"),
} as const;

/** Sorting na URL para listagem de contatos (`contactsOrderBy`, `contactsOrderDir`). */
export function useContactsSortQueryState() {
  const [params, setParams] = useQueryStates(contactsSortParsers);
  const orderBy = params.contactsOrderBy || "updatedAt";
  const orderDirection = normalizeSortDirection(params.contactsOrderDir, "DESC");
  return {
    orderBy,
    orderDirection,
    setSort: (next: { orderBy?: string | null; orderDirection?: SortDirection | null }) =>
      setParams({
        contactsOrderBy: next.orderBy ?? null,
        contactsOrderDir: next.orderDirection ?? null,
      }),
    raw: params,
  };
}

const contactsListTableParsers = {
  ...paginationParsers,
  ...contactsSortParsers,
  /** Busca na listagem (`q`) — no mesmo `useQueryStates` que page/sort (evita corrida com outro hook). */
  q: parseAsString.withDefault("").withOptions({
    history: "replace",
    scroll: false,
    limitUrlUpdates: throttle(200),
  }),
} as const;

/**
 * Paginação + sort + busca na mesma URL (`q`, `page`, `pageSize`, `contactsOrderBy`, `contactsOrderDir`).
 * Um único `setParams` evita nuqs perder keys ao misturar `useQueryState` + `useQueryStates`.
 */
export function useContactsListTableQueryState() {
  const [params, setParams] = useQueryStates(contactsListTableParsers);
  const pageSize = normalizePageSize(params.pageSize);
  const page = normalizePage(params.page);
  const orderBy = params.contactsOrderBy || "updatedAt";
  const orderDirection = normalizeSortDirection(params.contactsOrderDir, "DESC");
  const search = params.q ?? "";

  return {
    page,
    pageSize,
    orderBy,
    orderDirection,
    search,
    setSearch: (value: string) => void setParams({ q: value || null }),
    setParams,
    setPagination: (u: { page?: number; pageSize?: number }) => {
      const nextSize = u.pageSize !== undefined ? normalizePageSize(u.pageSize) : pageSize;
      const nextPage =
        u.page !== undefined
          ? normalizePage(u.page)
          : u.pageSize !== undefined
            ? 1
            : page;
      setParams({
        page: nextPage,
        pageSize: nextSize,
      });
    },
    raw: params,
  };
}

const contactsBlocklistSortParsers = {
  contactsBlOrderBy: parseAsString.withDefault("date"),
  contactsBlOrderDir: parseAsString.withDefault("DESC"),
} as const;

/** Sorting na URL para blocklist (`contactsBlOrderBy`, `contactsBlOrderDir`). */
export function useContactsBlocklistSortQueryState() {
  const [params, setParams] = useQueryStates(contactsBlocklistSortParsers);
  const orderBy = params.contactsBlOrderBy || "date";
  const orderDirection = normalizeSortDirection(params.contactsBlOrderDir, "DESC");
  return {
    orderBy,
    orderDirection,
    setSort: (next: { orderBy?: string | null; orderDirection?: SortDirection | null }) =>
      setParams({
        contactsBlOrderBy: next.orderBy ?? null,
        contactsBlOrderDir: next.orderDirection ?? null,
      }),
    raw: params,
  };
}

/**
 * Paginação + busca na URL (`contactsBlPage`, `contactsBlPageSize`, `contactsBlQ`).
 * Mesmo hook evita corrida ao resetar página: o merge do nuqs usa `location` e pode
 * perder `contactsBlQ` se ainda estiver no throttle; ao mudar a busca, use `setParams`
 * com página e `contactsBlQ` juntos (ver ContactBlocklistPage).
 */
export function useContactsBlocklistPaginationQueryState() {
  const [params, setParams] = useQueryStates({
    ...contactsBlocklistPaginationParsers,
    ...contactsBlocklistSortParsers,
  });
  const pageSize = normalizePageSize(params.contactsBlPageSize);
  const page = normalizePage(params.contactsBlPage);
  const search = params.contactsBlQ ?? "";
  const orderBy = params.contactsBlOrderBy || "date";
  const orderDirection = normalizeSortDirection(params.contactsBlOrderDir, "DESC");

  return {
    page,
    pageSize,
    search,
    setSearch: (value: string) => void setParams({ contactsBlQ: value || null }),
    orderBy,
    orderDirection,
    setSort: (next: { orderBy?: string | null; orderDirection?: SortDirection | null }) =>
      setParams({
        contactsBlOrderBy: next.orderBy ?? null,
        contactsBlOrderDir: next.orderDirection ?? null,
      }),
    skip: (page - 1) * pageSize,
    take: pageSize,
    setParams,
    setPagination: (u: { page?: number; pageSize?: number }) => {
      const nextSize =
        u.pageSize !== undefined ? normalizePageSize(u.pageSize) : pageSize;
      const nextPage =
        u.page !== undefined
          ? normalizePage(u.page)
          : u.pageSize !== undefined
            ? 1
            : page;
      setParams({ contactsBlPage: nextPage, contactsBlPageSize: nextSize });
    },
    raw: params,
  };
}

const searchOptions = {
  history: "replace" as const,
  scroll: false,
  limitUrlUpdates: throttle(200),
};

function createDrilldownListQueryState<
  const PK extends string,
  const PSK extends string,
>(
  paginationParsers: Record<PK, ReturnType<typeof parseAsInteger.withDefault>> &
    Record<PSK, ReturnType<typeof parseAsInteger.withDefault>>,
  pageKey: PK,
  pageSizeKey: PSK,
  searchKey: string,
  statusesKey: string,
) {
  return function useDrilldownListQueryState() {
    const [params, setParams] = useQueryStates(paginationParsers);
    const p = params as Record<string, number>;
    const pageSize = normalizePageSize(p[pageSizeKey]);
    const page = normalizePage(p[pageKey]);
    const [search, setSearch] = useQueryState(
      searchKey,
      parseAsString.withDefault("").withOptions(searchOptions),
    );
    const [statuses, setStatuses] = useQueryState(
      statusesKey,
      parseAsArrayOf(parseAsInteger).withDefault([]),
    );

    const setPagination = (u: { page?: number; pageSize?: number }) => {
      const nextSize =
        u.pageSize !== undefined ? normalizePageSize(u.pageSize) : pageSize;
      const nextPage =
        u.page !== undefined
          ? normalizePage(u.page)
          : u.pageSize !== undefined
            ? 1
            : page;
      setParams({ [pageKey]: nextPage, [pageSizeKey]: nextSize } as any);
    };

    return {
      page,
      pageSize,
      search,
      setSearch,
      statuses,
      setStatuses,
      setPagination,
      raw: params,
    };
  };
}

const renegotiationDetailsPaginationParsers = {
  rdPage: parseAsInteger.withDefault(1),
  rdPageSize: parseAsInteger.withDefault(10),
} as const;

/** Paginação + busca + status na URL para `/debt-negotiation/renegotiation-details`. */
export const useRenegotiationDetailsListQueryState = createDrilldownListQueryState(
  renegotiationDetailsPaginationParsers,
  "rdPage",
  "rdPageSize",
  "rdQ",
  "rdStatuses",
);

const negotiatedDetailsPaginationParsers = {
  ndPage: parseAsInteger.withDefault(1),
  ndPageSize: parseAsInteger.withDefault(10),
} as const;

/** Paginação + busca + status para `/debt-negotiation/negotiated-details`. */
export const useNegotiatedDetailsListQueryState = createDrilldownListQueryState(
  negotiatedDetailsPaginationParsers,
  "ndPage",
  "ndPageSize",
  "ndQ",
  "ndStatuses",
);

const recoveredDetailsPaginationParsers = {
  rcdPage: parseAsInteger.withDefault(1),
  rcdPageSize: parseAsInteger.withDefault(10),
} as const;

/** Paginação + busca + status para `/debt-negotiation/recovered-details`. */
export const useRecoveredDetailsListQueryState = createDrilldownListQueryState(
  recoveredDetailsPaginationParsers,
  "rcdPage",
  "rcdPageSize",
  "rcdQ",
  "rcdStatuses",
);
