import type { FilterConfig } from "../types";
import { RangeFilterBase } from "./RangeFilterBase";

interface RangeNumberFilterProps {
  filter: FilterConfig;
  values: unknown[];
  onChange: (values: unknown[]) => void;
}

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const parseNumber = (value: string): number | null => {
  if (!value || value.trim() === "") return null;
  if (!/^\d*\.?\d*$/.test(value)) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

const validateNumberInput = (value: string): string => {
  if (value === "" || /^\d*\.?\d*$/.test(value)) return value;
  return "";
};

export function RangeNumberFilter({ filter, values, onChange }: RangeNumberFilterProps) {
  return (
    <RangeFilterBase
      filter={filter}
      values={values}
      onChange={onChange}
      formatValue={formatNumber}
      parseValue={parseNumber}
      formatInput={validateNumberInput}
      minPlaceholder="Valor mínimo"
      maxPlaceholder="Valor máximo"
    />
  );
}

