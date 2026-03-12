import { useRenegotiationDetails } from "@/modules/debt-negotiation/hooks";
import type { RenegotiationDailyRow } from "@/modules/debt-negotiation/types/renegotiation-details";
import { useDetailsShowValues } from "@/shared/lib/nuqs-filters";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";

function formatDailyDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${day}/${month}`;
}

function mapApiRowToTable(row: RenegotiationDailyRow) {
  return {
    date: formatDailyDate(row.date),
    dateKey: row.date,
    registered: row.registeredDebts,
    collection: row.inCharge,
    cancelled: row.canceled,
    ignored: row.ignored,
    negotiating: row.inNegotiation,
    negotiated: row.negotiated,
    unpaid: row.negotiatedWithoutPayment,
    recovered: row.recovered,
  };
}

function CellValue({ locale, value }: { locale: string; value: string | number }) {
  if (value === "-" || value === "") {
    return <span className="text-muted-foreground">-</span>;
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return <span className="text-muted-foreground">-</span>;
  }
  return <span className="font-mono text-sm">{numericValue.toLocaleString(locale)}</span>;
}

export function DailyTable() {
  const { locale, t } = useI18n();
  const [showValues] = useDetailsShowValues();
  const { data, error } = useRenegotiationDetails({ showValues });

  const columns = [
    t("dashboard.daily.date"),
    t("dashboard.daily.registered"),
    t("dashboard.daily.collection"),
    t("dashboard.daily.cancelled"),
    t("dashboard.daily.ignored"),
    t("dashboard.daily.negotiating"),
    t("dashboard.daily.negotiated"),
    t("dashboard.daily.unpaid"),
    t("dashboard.daily.recovered"),
  ];

  const rows = data?.values?.map(mapApiRowToTable) ?? [];

  return (
    <div className="card-surface animate-fade-in overflow-hidden opacity-0" style={{ animationDelay: "700ms" }}>
      <div className="p-5 pb-0">
        <h3 className="mb-1 section-title">{t("dashboard.daily.title")}</h3>
        <p className="mb-4 section-subtitle">
          {showValues === "value" ? t("dashboard.daily.subtitleValue") : t("dashboard.daily.subtitle")}
        </p>
      </div>

      {error && (
        <div className="px-5 pb-4 text-sm text-destructive">
          Erro ao carregar dados diários.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column}
                  className="sticky top-0 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum dado no período.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.dateKey}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-accent/50",
                    index % 2 === 1 && "bg-muted/30",
                  )}
                >
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{row.date}</td>
                  <td className="px-4 py-2.5"><CellValue locale={locale} value={row.registered} /></td>
                  <td className="px-4 py-2.5"><CellValue locale={locale} value={row.collection} /></td>
                  <td className="px-4 py-2.5"><CellValue locale={locale} value={row.cancelled} /></td>
                  <td className="px-4 py-2.5 font-medium text-destructive"><CellValue locale={locale} value={row.ignored} /></td>
                  <td className="px-4 py-2.5"><CellValue locale={locale} value={row.negotiating} /></td>
                  <td className="px-4 py-2.5"><CellValue locale={locale} value={row.negotiated} /></td>
                  <td className="px-4 py-2.5 font-medium text-warning"><CellValue locale={locale} value={row.unpaid} /></td>
                  <td className="px-4 py-2.5 font-medium text-success"><CellValue locale={locale} value={row.recovered} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
