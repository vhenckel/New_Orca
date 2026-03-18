import { useCallback, useMemo } from "react";
import {
  throttle,
  type GenericParser,
  type Options,
  parseAsArrayOf,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";

import type {
  AppliedFilter,
  FilterConfig,
  FilterType,
} from "@/shared/components/dynamic-filters/types";

type HistoryMode = "push" | "replace";

export interface UseFilterPanelQueryStateOptions {
  searchKey?: string;
  searchDefault?: string;
  history?: HistoryMode;
  scroll?: boolean;
  throttleMs?: number;
}

type KeySpec = GenericParser<unknown> & Options & { defaultValue?: unknown };

function toNumberOrNull(value: string): number | null {
  const s = value.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function getFilterQueryKeys(filter: FilterConfig): string[] {
  if (Array.isArray(filter.paramKey) && filter.paramKey.length > 0) {
    return filter.paramKey;
  }
  if (typeof filter.paramKey === "string" && filter.paramKey) return [filter.paramKey];
  return [filter.id];
}

function isRangeType(type: FilterType) {
  return type === "range_number" || type === "range_currency" || type === "range_date";
}

export function useFilterPanelQueryState(
  filters: FilterConfig[],
  options: UseFilterPanelQueryStateOptions = {}
) {
  const {
    searchKey = "q",
    searchDefault = "",
    history = "replace",
    scroll = false,
    throttleMs = 200,
  } = options;

  const limitUrlUpdates = useMemo(() => throttle(throttleMs), [throttleMs]);

  const searchParser = useMemo(
    () =>
      parseAsString.withDefault(searchDefault).withOptions({
        history,
        scroll,
        limitUrlUpdates,
      }),
    [history, scroll, searchDefault, limitUrlUpdates]
  );

  const [searchValue, setSearchValue] = useQueryState(searchKey, searchParser);

  const filterParsers = useMemo(() => {
    const parsers: Record<string, KeySpec> = {};

    for (const f of filters) {
      if (f.type === "multiselect") {
        const [key] = getFilterQueryKeys(f);
        parsers[key] = parseAsArrayOf(parseAsString).withDefault([]).withOptions({
          history,
          scroll,
          limitUrlUpdates,
        }) as unknown as KeySpec;
      }

      if (isRangeType(f.type)) {
        const keys = getFilterQueryKeys(f);
        const minKey = keys[0] ?? `${f.id}Min`;
        const maxKey = keys[1] ?? `${f.id}Max`;

        parsers[minKey] = parseAsString
          .withDefault("")
          .withOptions({ history, scroll, limitUrlUpdates }) as unknown as KeySpec;
        parsers[maxKey] = parseAsString
          .withDefault("")
          .withOptions({ history, scroll, limitUrlUpdates }) as unknown as KeySpec;
      }
    }

    return parsers;
  }, [filters, history, scroll, limitUrlUpdates]);

  const [raw, setRaw] = useQueryStates(filterParsers);

  const appliedFilters: AppliedFilter[] = useMemo(() => {
    const out: AppliedFilter[] = [];

    for (const f of filters) {
      if (f.type === "multiselect") {
        const [key] = getFilterQueryKeys(f);
        const v = (raw as Record<string, unknown>)[key];
        const values =
          Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : [];
        if (values.length > 0) out.push({ id: f.id, values });
      }

      if (isRangeType(f.type)) {
        const keys = getFilterQueryKeys(f);
        const minKey = keys[0] ?? `${f.id}Min`;
        const maxKey = keys[1] ?? `${f.id}Max`;
        const minV = (raw as Record<string, unknown>)[minKey];
        const maxV = (raw as Record<string, unknown>)[maxKey];
        const minRaw = typeof minV === "string" ? minV : "";
        const maxRaw = typeof maxV === "string" ? maxV : "";
        if (!minRaw && !maxRaw) continue;

        if (f.type === "range_date") {
          out.push({ id: f.id, values: [minRaw || null, maxRaw || null] });
        } else {
          out.push({
            id: f.id,
            values: [minRaw ? toNumberOrNull(minRaw) : null, maxRaw ? toNumberOrNull(maxRaw) : null],
          });
        }
      }
    }

    return out;
  }, [filters, raw]);

  const onFiltersApply = useCallback(
    async (next: AppliedFilter[]) => {
      const patch: Record<string, unknown> = {};

      for (const f of filters) {
        if (f.type === "multiselect") {
          const [key] = getFilterQueryKeys(f);
          const found = next.find((x) => x.id === f.id);
          patch[key] = Array.isArray(found?.values) ? found!.values.map(String) : [];
        }

        if (isRangeType(f.type)) {
          const keys = getFilterQueryKeys(f);
          const minKey = keys[0] ?? `${f.id}Min`;
          const maxKey = keys[1] ?? `${f.id}Max`;
          const found = next.find((x) => x.id === f.id);
          const values = Array.isArray(found?.values) ? found!.values : [];
          const min = values[0] ?? null;
          const max = values[1] ?? null;
          patch[minKey] = min == null || min === "" ? "" : String(min);
          patch[maxKey] = max == null || max === "" ? "" : String(max);
        }
      }

      await setRaw(patch);
    },
    [filters, setRaw]
  );

  const onFiltersClear = useCallback(async () => {
    const patch: Record<string, unknown> = {};

    for (const f of filters) {
      if (f.type === "multiselect") {
        const [key] = getFilterQueryKeys(f);
        patch[key] = [];
      }

      if (isRangeType(f.type)) {
        const keys = getFilterQueryKeys(f);
        const minKey = keys[0] ?? `${f.id}Min`;
        const maxKey = keys[1] ?? `${f.id}Max`;
        patch[minKey] = "";
        patch[maxKey] = "";
      }
    }

    await setRaw(patch);
  }, [filters, setRaw]);

  return {
    searchValue,
    onSearchChange: setSearchValue,
    appliedFilters,
    onFiltersApply,
    onFiltersClear,
    raw,
  };
}

