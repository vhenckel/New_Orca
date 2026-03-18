import { useEffect, useState } from "react";

import { Separator } from "@/shared/ui/separator";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

import type { FilterConfig } from "../types";

interface RangeFilterBaseProps {
  filter: FilterConfig;
  values: unknown[];
  onChange: (values: unknown[]) => void;
  formatValue: (value: number | null | undefined) => string;
  parseValue: (value: string) => number | null;
  formatInput?: (value: string) => string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export function RangeFilterBase({
  filter,
  values,
  onChange,
  formatValue,
  parseValue,
  formatInput,
  minPlaceholder = "Valor mínimo",
  maxPlaceholder = "Valor máximo",
}: RangeFilterBaseProps) {
  const minId = `range-min-${filter.id}`;
  const maxId = `range-max-${filter.id}`;

  const getInitialValues = (): { min: string; max: string } => {
    if (Array.isArray(values) && values.length === 2) {
      const [min, max] = values as [unknown, unknown];
      return {
        min: typeof min === "number" ? formatValue(min) : "",
        max: typeof max === "number" ? formatValue(max) : "",
      };
    }
    return { min: "", max: "" };
  };

  const [minValue, setMinValue] = useState<string>(getInitialValues().min);
  const [maxValue, setMaxValue] = useState<string>(getInitialValues().max);

  useEffect(() => {
    const initial = getInitialValues();
    setMinValue(initial.min);
    setMaxValue(initial.max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const updateValues = (min: number | null, max: number | null, skipValidation = false) => {
    if (!skipValidation && min !== null && max !== null && min > max) return;

    const boundedMin = min !== null && filter.min !== undefined ? Math.max(min, filter.min) : min;
    const boundedMax = max !== null && filter.max !== undefined ? Math.min(max, filter.max) : max;

    if (boundedMin !== null || boundedMax !== null) onChange([boundedMin, boundedMax]);
    else onChange([]);
  };

  const handleMinChange = (value: string) => {
    if (value === "") {
      setMinValue("");
      return;
    }
    const formatted = formatInput ? formatInput(value) : value;
    setMinValue(formatted);
  };

  const handleMaxChange = (value: string) => {
    if (value === "") {
      setMaxValue("");
      return;
    }
    const formatted = formatInput ? formatInput(value) : value;
    setMaxValue(formatted);
  };

  const handleMinBlur = () => {
    const parsed = parseValue(minValue);
    setMinValue(parsed !== null ? formatValue(parsed) : "");
    updateValues(parsed, parseValue(maxValue), false);
  };

  const handleMaxBlur = () => {
    const parsed = parseValue(maxValue);
    setMaxValue(parsed !== null ? formatValue(parsed) : "");
    updateValues(parseValue(minValue), parsed, false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{filter.label}</div>
      </div>
      <Separator />

      <div className="px-4 pb-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={minId}>Valor mínimo</FieldLabel>
            <FieldContent>
              <Input
                id={minId}
                type="text"
                inputMode="decimal"
                placeholder={minPlaceholder}
                value={minValue}
                onChange={(e) => handleMinChange(e.target.value)}
                onBlur={handleMinBlur}
                className="h-9"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor={maxId}>Valor máximo</FieldLabel>
            <FieldContent>
              <Input
                id={maxId}
                type="text"
                inputMode="decimal"
                placeholder={maxPlaceholder}
                value={maxValue}
                onChange={(e) => handleMaxChange(e.target.value)}
                onBlur={handleMaxBlur}
                className="h-9"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
