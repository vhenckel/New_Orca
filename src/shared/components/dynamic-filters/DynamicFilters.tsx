import { useEffect, useRef, useState } from "react";
import { Filter as FilterIcon } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Separator } from "@/shared/ui/separator";

import { FilterCategory } from "./FilterCategory";
import { FilterRenderer } from "./FilterRenderer";
import type { AppliedFilter, FilterConfig } from "./types";
import { FilterType } from "./types";
import { useI18n } from "@/shared/i18n/useI18n";

interface DynamicFiltersProps {
  filters: FilterConfig[];
  appliedFilters: AppliedFilter[];
  onApply: (filters: AppliedFilter[]) => void;
  isLoading?: boolean;
}

export function DynamicFilters({
  filters,
  appliedFilters,
  onApply,
  isLoading = false,
}: DynamicFiltersProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FilterConfig | null>(null);
  const [clickedCategory, setClickedCategory] = useState<FilterConfig | null>(null);
  const [tempSelectedOptions, setTempSelectedOptions] = useState<Record<string, unknown[]>>({});
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);

  const loadingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const temp: Record<string, unknown[]> = {};
    for (const f of appliedFilters) temp[f.id] = Array.isArray(f.values) ? f.values : [];
    setTempSelectedOptions(temp);
  }, [appliedFilters]);

  useEffect(() => {
    if (open && filters.length > 0 && !selectedCategory) {
      setSelectedCategory(filters[0]);
      setClickedCategory(filters[0]);
    }
  }, [open, filters, selectedCategory]);

  useEffect(() => {
    if (!open) setLoadingCategoryId(null);
  }, [open]);

  useEffect(() => {
    if (!selectedCategory || !loadingCategoryId) return;
    if (loadingCategoryId !== selectedCategory.id) setLoadingCategoryId(null);
  }, [selectedCategory, loadingCategoryId]);

  useEffect(() => {
    if (!loadingCategoryId) return;
    if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = window.setTimeout(() => setLoadingCategoryId(null), 10_000);
    return () => {
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    };
  }, [loadingCategoryId]);

  const handleCategoryHover = (category: FilterConfig | null) => {
    setHoveredCategory(category?.id ?? null);
    if (!clickedCategory) setSelectedCategory(category);
  };

  const handleCategoryClick = (category: FilterConfig) => {
    setClickedCategory(category);
    setSelectedCategory(category);
    if (category.loadOptions) setLoadingCategoryId(category.id);
    else setLoadingCategoryId(null);
  };

  const handleLoadingChange = (filterId: string, nextLoading: boolean) => {
    if (nextLoading) setLoadingCategoryId(filterId);
    else setLoadingCategoryId((prev) => (prev === filterId ? null : prev));
  };

  const handleValuesChange = (filterId: string, values: unknown[]) => {
    setTempSelectedOptions((prev) => ({ ...prev, [filterId]: values }));
  };

  const handleApply = () => {
    const next: AppliedFilter[] = [];
    for (const [id, values] of Object.entries(tempSelectedOptions)) {
      if (Array.isArray(values) && values.length > 0) next.push({ id, values });
    }
    onApply(next);
    setOpen(false);
    setClickedCategory(null);
  };

  const handleClose = () => {
    const temp: Record<string, unknown[]> = {};
    for (const f of appliedFilters) temp[f.id] = Array.isArray(f.values) ? f.values : [];
    setTempSelectedOptions(temp);
    setOpen(false);
    setClickedCategory(null);
  };

  const getAppliedCount = (filterId: string): number => {
    const cfg = filters.find((f) => f.id === filterId);
    const values = tempSelectedOptions[filterId];

    if (
      cfg?.type === FilterType.RANGE_NUMBER ||
      cfg?.type === FilterType.RANGE_CURRENCY ||
      cfg?.type === FilterType.RANGE_DATE
    ) {
      if (Array.isArray(values) && values.length === 2) {
        const [min, max] = values;
        if (min != null || max != null) return 1;
      }
      return 0;
    }

    return Array.isArray(values) ? values.length : 0;
  };

  const hasAppliedFilters = appliedFilters.length > 0;
  const buttonVariant = hasAppliedFilters ? "secondary" : "outline";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative inline-flex">
          <Button
            type="button"
            variant={buttonVariant}
            size="sm"
            className="gap-1.5"
            disabled={isLoading || filters.length === 0}
          >
            <FilterIcon data-icon="inline-start" />
            {t("components.dynamicFilters.button")}
          </Button>
          {hasAppliedFilters && (
            <Badge
              variant="destructive"
              className="pointer-events-none absolute right-2 top-2 h-2 w-2 min-w-0 rounded-full border-0 p-0 text-[0] leading-none"
              aria-hidden
            >
              .
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-auto p-0">
        <h2 className="sr-only">{t("components.dynamicFilters.headingSr")}</h2>
        <div className="flex w-[640px] gap-2">
          <div className="w-[300px] overflow-hidden rounded-lg border border-border bg-popover shadow-md">
            <div className="py-2">
              {filters.map((f) => (
                <FilterCategory
                  key={f.id}
                  filter={f}
                  isHovered={hoveredCategory === f.id}
                  isSelected={clickedCategory?.id === f.id}
                  count={getAppliedCount(f.id)}
                  onHover={handleCategoryHover}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          </div>

          <div className="flex w-[340px] flex-col overflow-hidden rounded-lg border border-border bg-popover shadow-md">
            {selectedCategory &&
            (hoveredCategory === selectedCategory.id || clickedCategory?.id === selectedCategory.id) ? (
              <>
                <div className="min-h-[320px]">
                  <FilterRenderer
                    filter={selectedCategory}
                    appliedValues={(tempSelectedOptions[selectedCategory.id] ?? []) as unknown[]}
                    onChange={(values) => handleValuesChange(selectedCategory.id, values)}
                    onLoadingChange={handleLoadingChange}
                  />
                </div>

                <Separator />
                <div className="flex items-center justify-end gap-2 px-4 py-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t("components.dynamicFilters.close")}
                  </Button>
                  <Button type="button" onClick={handleApply} disabled={Boolean(loadingCategoryId)}>
                    {t("components.dynamicFilters.apply")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center px-4 py-6 text-sm text-muted-foreground">
                {t("components.dynamicFilters.selectCategory")}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

