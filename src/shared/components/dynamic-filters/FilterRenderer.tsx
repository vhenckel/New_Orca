import type { FilterConfig } from "./types";
import { FilterType } from "./types";
import { MultiSelectFilter } from "./filters/MultiSelectFilter";
import { RangeCurrencyFilter } from "./filters/RangeCurrencyFilter";
import { RangeNumberFilter } from "./filters/RangeNumberFilter";

interface FilterRendererProps {
  filter: FilterConfig;
  appliedValues: unknown[];
  onChange: (values: unknown[]) => void;
  onLoadingChange?: (filterId: string, isLoading: boolean) => void;
}

export function FilterRenderer({ filter, appliedValues, onChange, onLoadingChange }: FilterRendererProps) {
  switch (filter.type) {
    case FilterType.MULTISELECT:
      return (
        <MultiSelectFilter
          filter={filter}
          values={appliedValues}
          onChange={onChange}
          onLoadingChange={onLoadingChange}
        />
      );
    case FilterType.RANGE_NUMBER:
      return <RangeNumberFilter filter={filter} values={appliedValues} onChange={onChange} />;
    case FilterType.RANGE_CURRENCY:
      return <RangeCurrencyFilter filter={filter} values={appliedValues} onChange={onChange} />;
    case FilterType.RANGE_DATE:
      return <div className="px-4 py-6 text-sm text-muted-foreground">Range Date Filter — em breve</div>;
    case FilterType.SEARCH:
      return <div className="px-4 py-6 text-sm text-muted-foreground">Search Filter — em breve</div>;
    default:
      return null;
  }
}

