import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { getDefaultDateRange, useDateRangeQueryState } from "@/shared/lib/nuqs-filters";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Retorna a data final limitada a hoje (nunca no futuro). */
function capEndToToday(end: Date, today: Date): Date {
  return isAfter(end, today) ? today : end;
}

export function DashboardDateRangePicker() {
  const { t } = useI18n();
  const { startDate, endDate, setDateRange } = useDateRangeQueryState();
  const [open, setOpen] = useState(false);

  const range: DateRange | undefined =
    startDate && endDate
      ? { from: isoToDate(startDate), to: isoToDate(endDate) }
      : undefined;

  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const handleSelect = (next: DateRange | undefined) => {
    if (!next?.from) return;
    const to = capEndToToday(next.to ?? next.from, today);
    setDateRange({ startDate: dateToIso(next.from), endDate: dateToIso(to) });
    setOpen(false);
  };

  const setPreset = (start: Date, end: Date) => {
    const endCapped = capEndToToday(end, today);
    setDateRange({ startDate: dateToIso(start), endDate: dateToIso(endCapped) });
    setOpen(false);
  };
  const defaultRange = getDefaultDateRange();

  const label =
    startDate && endDate
      ? `${format(isoToDate(startDate), "dd/MM/yyyy", { locale: ptBR })} → ${format(isoToDate(endDate), "dd/MM/yyyy", { locale: ptBR })}`
      : t("dashboard.dateRange.placeholder");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-normal"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="min-w-[180px] text-left sm:min-w-[220px]">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="range"
            defaultMonth={range?.from ?? isoToDate(defaultRange.startDate)}
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
          <div className="flex flex-col gap-1 border-l border-border p-3">
            <span className="mb-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.dateRange.presets")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => setPreset(isoToDate(defaultRange.startDate), isoToDate(defaultRange.endDate))}
            >
              {t("dashboard.dateRange.all")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => setPreset(today, today)}
            >
              {t("dashboard.dateRange.today")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => setPreset(startOfWeek(today, { locale: ptBR }), endOfWeek(today, { locale: ptBR }))}
            >
              {t("dashboard.dateRange.thisWeek")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => setPreset(startOfMonth(today), endOfMonth(today))}
            >
              {t("dashboard.dateRange.thisMonth")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => setPreset(startOfQuarter(today), endOfQuarter(today))}
            >
              {t("dashboard.dateRange.thisQuarter")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => setPreset(startOfYear(today), endOfYear(today))}
            >
              {t("dashboard.dateRange.thisYear")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
