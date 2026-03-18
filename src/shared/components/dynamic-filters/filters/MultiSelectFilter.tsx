import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Checkbox } from "@/shared/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/shared/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";

import type { FilterConfig, FilterOption, RenderLabelParams } from "../types";

function asLoadResult(result: unknown): { options: FilterOption[]; hasMore: boolean } {
  if (Array.isArray(result)) return { options: result as FilterOption[], hasMore: false };
  if (result && typeof result === "object" && "options" in result) {
    const r = result as { options: unknown; hasMore?: unknown };
    return {
      options: Array.isArray(r.options) ? (r.options as FilterOption[]) : [],
      hasMore: Boolean(r.hasMore),
    };
  }
  return { options: [], hasMore: false };
}

interface MultiSelectFilterProps {
  filter: FilterConfig;
  values: unknown[];
  onChange: (values: unknown[]) => void;
  onLoadingChange?: (filterId: string, isLoading: boolean) => void;
}

export function MultiSelectFilter({ filter, values, onChange, onLoadingChange }: MultiSelectFilterProps) {
  const searchId = `df-search-${filter.id}`;
  const [localSearchValue, setLocalSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<FilterOption[]>(Array.isArray(filter.options) ? filter.options : []);
  const listRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const requestSeq = useRef(0);

  const hasDynamicLoading = Boolean(filter.loadOptions);

  const filteredOptions = useMemo(() => {
    const availableOptions = hasDynamicLoading ? options : Array.isArray(filter.options) ? filter.options : options;
    if (!Array.isArray(availableOptions)) return [];
    if (filter.searchable && hasDynamicLoading) return availableOptions;
    const term = localSearchValue.trim().toLowerCase();
    if (!term) return availableOptions;
    return availableOptions.filter((opt) => String(opt.label).toLowerCase().includes(term));
  }, [filter.options, filter.searchable, hasDynamicLoading, localSearchValue, options]);

  const notifyLoading = (next: boolean) => {
    onLoadingChange?.(filter.id, next);
  };

  const loadPage = async (nextPage: number, nextSearchTerm: string, mode: "replace" | "append") => {
    if (!filter.loadOptions) return;
    const seq = ++requestSeq.current;
    try {
      if (mode === "replace") {
        setIsLoading(true);
        notifyLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await filter.loadOptions({
        searchTerm: nextSearchTerm,
        page: nextPage,
        pageSize: 10,
      });
      if (seq !== requestSeq.current) return;

      const { options: newOptions, hasMore: nextHasMore } = asLoadResult(result);
      setHasMore(nextHasMore);
      setPage(nextPage);
      setOptions((prev) => (mode === "append" ? [...prev, ...newOptions] : newOptions));
    } finally {
      if (seq === requestSeq.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
        notifyLoading(false);
      }
    }
  };

  useEffect(() => {
    setLocalSearchValue("");
    setSearchTerm("");
    setPage(1);
    setHasMore(false);
    setIsLoading(false);
    setIsLoadingMore(false);
    setOptions(Array.isArray(filter.options) ? filter.options : []);
    requestSeq.current += 1;

    if (filter.loadOptionsOnMount && filter.loadOptions) {
      void loadPage(1, "", "replace");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.id]);

  useEffect(() => {
    if (!hasDynamicLoading) return;
    if (!filter.searchable) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setSearchTerm(localSearchValue);
      void loadPage(1, localSearchValue, "replace");
    }, 500);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchValue, filter.searchable, hasDynamicLoading]);

  const handleScroll = async () => {
    const el = listRef.current;
    if (!el) return;
    if (!hasMore || isLoadingMore || isLoading) return;
    if (!filter.loadOptions) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (!nearBottom) return;
    await loadPage(page + 1, searchTerm, "append");
  };

  const setSelected = (optionValue: unknown, selected: boolean) => {
    const exists = values.some((v) => String(v) === String(optionValue));
    if (selected && !exists) onChange([...values, optionValue]);
    if (!selected && exists) onChange(values.filter((v) => String(v) !== String(optionValue)));
  };

  const toggleRow = (optionValue: unknown) => {
    const selected = values.some((v) => String(v) === String(optionValue));
    setSelected(optionValue, !selected);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{filter.label}</div>
        {filter.searchable && (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={searchId} className="sr-only">
                Buscar opções
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon>
                    <Search data-icon="inline-start" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={searchId}
                    type="text"
                    placeholder="Buscar..."
                    value={localSearchValue}
                    onChange={(e) => setLocalSearchValue(e.target.value)}
                    disabled={isLoading}
                    className="h-9"
                  />
                  {isLoading && (
                    <InputGroupAddon align="inline-end">
                      <Loader2 className="animate-spin text-primary" />
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </FieldContent>
            </Field>
          </FieldGroup>
        )}
      </div>
      <Separator />

      <div ref={listRef} className="max-h-[280px] flex-1 overflow-y-auto py-2" onScroll={handleScroll}>
        {isLoading && filteredOptions.length === 0 ? (
          <div className="flex flex-col gap-3 px-4 py-6" aria-busy="true" aria-label="Carregando opções">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <p className="text-center text-sm text-muted-foreground">Carregando opções…</p>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="px-4 py-8" role="status">
            <Empty className="border-0 p-0">
              <EmptyHeader>
                <EmptyTitle>Nenhum resultado</EmptyTitle>
                <EmptyDescription>Ajuste a busca ou escolha outra categoria.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredOptions.map((option) => {
              const selected = values.some((v) => String(v) === String(option.value));
              const labelParams: RenderLabelParams = {
                label: option.label,
                value: option.value,
                ...option,
              };
              const displayLabel = filter.renderLabel ? filter.renderLabel(labelParams) : option.label;
              const optId = `df-opt-${filter.id}-${String(option.value)}`;
              return (
                <div
                  key={String(option.value)}
                  className="flex w-full items-start gap-3 px-4 py-2 hover:bg-accent"
                >
                  <div className="mt-0.5 shrink-0">
                    <Checkbox
                      id={optId}
                      checked={selected}
                      onCheckedChange={(c) => setSelected(option.value, c === true)}
                      aria-label={typeof displayLabel === "string" ? displayLabel : String(option.label)}
                    />
                  </div>
                  {typeof displayLabel === "string" ? (
                    <label htmlFor={optId} className="flex-1 cursor-pointer text-sm text-foreground">
                      {displayLabel}
                    </label>
                  ) : (
                    <button
                      type="button"
                      className="flex-1 text-left text-sm text-foreground hover:underline"
                      onClick={() => toggleRow(option.value)}
                    >
                      {displayLabel}
                    </button>
                  )}
                </div>
              );
            })}
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                Carregando mais…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
