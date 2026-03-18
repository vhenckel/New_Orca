import type { FilterConfig } from "../types";
import { RangeFilterBase } from "./RangeFilterBase";
import { formatCurrencyBRL, formatCurrencyInputBRL, parseCurrencyBRL } from "./currency";

interface RangeCurrencyFilterProps {
  filter: FilterConfig;
  values: unknown[];
  onChange: (values: unknown[]) => void;
}

export function RangeCurrencyFilter({ filter, values, onChange }: RangeCurrencyFilterProps) {
  return (
    <RangeFilterBase
      filter={filter}
      values={values}
      onChange={onChange}
      formatValue={formatCurrencyBRL}
      parseValue={parseCurrencyBRL}
      formatInput={formatCurrencyInputBRL}
      minPlaceholder="R$ 0,00"
      maxPlaceholder="R$ 0,00"
    />
  );
}

