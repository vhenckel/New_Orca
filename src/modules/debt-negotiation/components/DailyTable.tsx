import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";

const rows = [
  { date: "02/Mar", registered: 42, collection: 333, cancelled: "-", ignored: 219, negotiating: 6, negotiated: 2, unpaid: 9, recovered: 3 },
  { date: "03/Mar", registered: "-", collection: 352, cancelled: "-", ignored: 340, negotiating: 8, negotiated: 4, unpaid: 12, recovered: 2 },
  { date: "04/Mar", registered: "-", collection: 341, cancelled: "-", ignored: 330, negotiating: 9, negotiated: 4, unpaid: 16, recovered: 2 },
  { date: "05/Mar", registered: "-", collection: 340, cancelled: "-", ignored: 336, negotiating: 10, negotiated: "-", unpaid: 19, recovered: 1 },
  { date: "06/Mar", registered: "-", collection: 341, cancelled: "-", ignored: 332, negotiating: 12, negotiated: 3, unpaid: 20, recovered: 1 },
  { date: "09/Mar", registered: "-", collection: 333, cancelled: "-", ignored: "-", negotiating: 12, negotiated: 1, unpaid: 26, recovered: 2 },
  { date: "10/Mar", registered: "-", collection: 302, cancelled: "-", ignored: 324, negotiating: 13, negotiated: 4, unpaid: 22, recovered: 3 },
];

function CellValue({ locale, value }: { locale: string; value: string | number }) {
  if (value === "-") {
    return <span className="text-muted-foreground">-</span>;
  }

  const numericValue = Number(value);
  return <span className="font-mono text-sm">{numericValue.toLocaleString(locale)}</span>;
}

export function DailyTable() {
  const { locale, t } = useI18n();
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

  return (
    <div className="card-surface animate-fade-in overflow-hidden opacity-0" style={{ animationDelay: "700ms" }}>
      <div className="p-5 pb-0">
        <h3 className="mb-1 section-title">{t("dashboard.daily.title")}</h3>
        <p className="mb-4 section-subtitle">{t("dashboard.daily.subtitle")}</p>
      </div>

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
            {rows.map((row, index) => (
              <tr
                key={row.date}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
