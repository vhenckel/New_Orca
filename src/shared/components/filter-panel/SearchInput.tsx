import { useEffect, useRef, useState } from "react";
import { Search, XCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearSearchAriaLabel?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  clearSearchAriaLabel = "Clear search",
  className,
  inputClassName,
  autoFocus = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const commitNow = (next: string) => onChange(next);

  const handleClear = () => {
    setLocalValue("");
    commitNow("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={localValue}
        onChange={(e) => {
          const next = e.target.value;
          setLocalValue(next);
          onChange(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitNow(localValue);
          if (e.key === "Escape") {
            e.preventDefault();
            handleClear();
          }
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn("pl-9 pr-10", inputClassName)}
      />
      {localValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={handleClear}
          aria-label={clearSearchAriaLabel}
        >
          <XCircle className="size-4 text-muted-foreground" />
        </Button>
      ) : null}
    </div>
  );
}

