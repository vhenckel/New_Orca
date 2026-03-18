import { useMemo, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { DynamicFilters } from "@/shared/components/dynamic-filters/DynamicFilters";
import { FilterType, type AppliedFilter, type FilterConfig } from "@/shared/components/dynamic-filters/types";
import { formatCurrencyBRL } from "@/shared/components/dynamic-filters/filters/currency";
import { SearchInput } from "@/shared/components/filter-panel/SearchInput";
import { useI18n } from "@/shared/i18n/useI18n";

export interface FilterPanelProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Filters
  filters: FilterConfig[];
  appliedFilters: AppliedFilter[];
  onFiltersApply: (filters: AppliedFilter[]) => void;
  onFiltersClear: () => void;

  // Optional
  /** Título da faixa; omitir = i18n `components.filterPanel.sectionTitle` ("Buscar"). "" = sem título. */
  title?: string;
  /** default true; false = não mostra linha de título (ex.: página já tem H1). */
  showSectionTitle?: boolean;
  className?: string;
  dense?: boolean;
  isLoading?: boolean;
}

function isRangeType(type: FilterType) {
  return type === FilterType.RANGE_NUMBER || type === FilterType.RANGE_CURRENCY || type === FilterType.RANGE_DATE;
}

function formatRangeLabel(type: FilterType, values: unknown[]) {
  const min = values?.[0];
  const max = values?.[1];

  const fmt = (v: unknown) => {
    if (v == null || v === "") return "—";
    if (type === FilterType.RANGE_CURRENCY && typeof v === "number") return formatCurrencyBRL(v);
    if (type === FilterType.RANGE_DATE) return String(v);
    return String(v);
  };

  return `${fmt(min)} – ${fmt(max)}`;
}

function coerceFilterOptionValue(value: unknown): string | number {
  if (typeof value === "string" || typeof value === "number") return value;
  return String(value);
}

export function FilterPanel({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showSearch = true,
  filters,
  appliedFilters,
  onFiltersApply,
  onFiltersClear,
  title,
  showSectionTitle = true,
  className,
  dense = false,
  isLoading = false,
}: FilterPanelProps) {
  const { t } = useI18n();
  const sectionTitle =
    title !== undefined ? title : t("components.filterPanel.sectionTitle");
  const placeholder =
    searchPlaceholder ?? t("components.filterPanel.searchPlaceholder");
  const clearLabel = t("components.filterPanel.clearAll");
  const removeFilterAria = t("components.filterPanel.removeFilterAria");
  const searchClearAria = t("components.filterPanel.searchClearAria");
  const showHeading = showSectionTitle && sectionTitle !== "";

  const filterById = useMemo(() => {
    const m = new Map<string, FilterConfig>();
    for (const f of filters) m.set(f.id, f);
    return m;
  }, [filters]);

  const hasAny = appliedFilters.length > 0 || (showSearch && Boolean(searchValue));
  const padding = dense ? "p-3" : "p-4";

  const handleClearAll = () => {
    if (showSearch) onSearchChange("");
    onFiltersClear();
  };

  const handleRemove = (filterId: string, valueToRemove?: unknown) => {
    const cfg = filterById.get(filterId);
    if (!cfg) return;

    if (isRangeType(cfg.type)) {
      onFiltersApply(appliedFilters.filter((f) => f.id !== filterId));
      return;
    }

    if (valueToRemove === undefined) {
      onFiltersApply(appliedFilters.filter((f) => f.id !== filterId));
      return;
    }

    const next = appliedFilters
      .map((f) => {
        if (f.id !== filterId) return f;
        const values = Array.isArray(f.values) ? f.values.filter((v) => v !== valueToRemove) : [];
        return { ...f, values };
      })
      .filter((f) => f.values.length > 0);

    onFiltersApply(next);
  };

  const badges = useMemo(() => {
    const out: Array<{
      key: string;
      filterId: string;
      value?: unknown;
      label: string | number | null;
      custom?: ReactNode;
    }> = [];

    for (const f of appliedFilters) {
      const cfg = filterById.get(f.id);
      if (!cfg) continue;

      if (isRangeType(cfg.type)) {
        const label = formatRangeLabel(cfg.type, f.values);
        const custom = cfg.renderBadge
          ? cfg.renderBadge({ label, value: String(label) })
          : `${cfg.label}: ${label}`;
        out.push({ key: `${f.id}-range`, filterId: f.id, label, custom });
        continue;
      }

      for (const value of f.values) {
        const opt = cfg.options?.find((o) => String(o.value) === String(value));
        const baseLabel = opt?.label ?? String(value);
        const optionValue = coerceFilterOptionValue(value);
        const displayLabel = cfg.renderLabel
          ? cfg.renderLabel({ label: baseLabel, value: optionValue, ...(opt ?? {}) })
          : baseLabel;

        const custom = cfg.renderBadge
          ? cfg.renderBadge({ label: baseLabel, value: optionValue, ...(opt ?? {}) })
          : `${cfg.label}: ${String(baseLabel)}`;

        // If renderBadge returns a string/node, keep it; otherwise show fallback text
        out.push({
          key: `${f.id}-${String(value)}`,
          filterId: f.id,
          value,
          label: typeof displayLabel === "string" || typeof displayLabel === "number" ? displayLabel : baseLabel,
          custom,
        });
      }
    }

    return out;
  }, [appliedFilters, filterById]);

  return (
    <section className={cn("w-full rounded-md border border-border bg-background", padding, className)}>
      {showHeading ? (
        <div className={cn("font-medium", dense ? "mb-2" : "mb-3")}>{sectionTitle}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {showSearch ? (
          <div className="min-w-[240px] flex-1">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={placeholder}
              clearSearchAriaLabel={searchClearAria}
              inputClassName={dense ? "h-9" : undefined}
            />
          </div>
        ) : null}

        <DynamicFilters
          filters={filters}
          appliedFilters={appliedFilters}
          onApply={onFiltersApply}
          isLoading={isLoading}
        />

        <Button type="button" variant="secondary" onClick={handleClearAll} disabled={!hasAny}>
          {clearLabel}
        </Button>
      </div>

      {badges.length > 0 ? (
        <>
          <div className={dense ? "mt-3" : "mt-4"}>
            <Separator />
          </div>
          <div className={cn("mt-3 flex flex-wrap items-center gap-2", dense ? "text-xs" : "text-sm")}>
            {badges.map((b) => (
              <Badge
                key={b.key}
                variant="secondary"
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-1"
              >
                <span className="truncate">{b.custom ?? String(b.label ?? "")}</span>
                <button
                  type="button"
                  className="ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-muted"
                  onClick={() => handleRemove(b.filterId, b.value)}
                  aria-label={removeFilterAria}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

