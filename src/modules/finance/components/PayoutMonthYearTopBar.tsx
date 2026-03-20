import { useMemo } from "react";

import { usePayoutMonthYearQueryState } from "@/modules/finance/lib/payout-query-state";
import { useI18n } from "@/shared/i18n/useI18n";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

/**
 * Filtro mês/ano da lista de repasses (URL: payoutMonth, payoutYear).
 * Exibido no TopBar na rota de conciliação.
 */
export function PayoutMonthYearTopBar() {
  const { t } = useI18n();
  const { month, year, setMonthYear } = usePayoutMonthYearQueryState();

  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "long",
      }),
    [],
  );
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => {
        const monthNumber = index + 1;
        const monthLabel = monthFormatter.format(new Date(2020, index, 1));
        return {
          value: String(monthNumber),
          label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        };
      }),
    [monthFormatter],
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={String(month)} onValueChange={(value) => setMonthYear({ month: Number(value), year })}>
        <SelectTrigger className="h-8 w-[7.5rem]" aria-label={t("pages.finance.payouts.filters.monthPlaceholder")}>
          <SelectValue placeholder={t("pages.finance.payouts.filters.monthPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {monthOptions.map((monthOption) => (
              <SelectItem key={monthOption.value} value={monthOption.value}>
                {monthOption.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        type="number"
        className="h-8 w-20"
        aria-label={t("pages.finance.payouts.filters.year")}
        value={year}
        onChange={(e) => setMonthYear({ month, year: Number(e.target.value) || year })}
      />
    </div>
  );
}
