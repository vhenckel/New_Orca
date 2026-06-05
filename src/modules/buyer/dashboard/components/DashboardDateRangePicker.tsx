import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useQueryStates } from "nuqs";

import { dashboardDateFilterParsers } from "@/modules/buyer/dashboard/lib/dashboard-date-filters";
import { getCurrentMonthToTodayRange } from "@/shared/lib/date-range";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useI18n } from "@/shared/i18n/useI18n";

function formatRangeLabel(from: Date, to: Date, locale: string): string {
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;
  return `${format(from, "dd/MM/yyyy", { locale: dateLocale })} – ${format(to, "dd/MM/yyyy", { locale: dateLocale })}`;
}

export function DashboardDateRangePicker() {
  const { t, locale } = useI18n();
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;

  const [query, setQuery] = useQueryStates(dashboardDateFilterParsers);

  const dateRange = useMemo((): DateRange => {
    const defaults = getCurrentMonthToTodayRange();
    return {
      from: query.from ?? defaults.from,
      to: query.to ?? defaults.to,
    };
  }, [query.from, query.to]);

  const rangeLabel = useMemo(() => {
    const from = dateRange.from;
    const to = dateRange.to ?? from;
    if (!from || !to) return t("app.topbar.dateRangePick");
    return formatRangeLabel(from, to, locale);
  }, [dateRange.from, dateRange.to, locale, t]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setQuery({ from: null, to: null });
      return;
    }

    setQuery({
      from: range.from,
      to: range.to ?? range.from,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-border bg-background font-normal text-muted-foreground"
          aria-label={t("app.topbar.dateRange")}
        >
          <CalendarIcon className="size-4 shrink-0" aria-hidden />
          <span className="max-w-[min(100vw-8rem,220px)] truncate text-left">{rangeLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={dateLocale}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}
