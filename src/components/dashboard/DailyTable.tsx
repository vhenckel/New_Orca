import { cn } from "@/lib/utils";

const rows = [
  { date: "02/Mar", registered: 42, collection: 333, cancelled: "-", ignored: 219, negotiating: 6, negotiated: 2, unpaid: 9, recovered: 3 },
  { date: "03/Mar", registered: "-", collection: 352, cancelled: "-", ignored: 340, negotiating: 8, negotiated: 4, unpaid: 12, recovered: 2 },
  { date: "04/Mar", registered: "-", collection: 341, cancelled: "-", ignored: 330, negotiating: 9, negotiated: 4, unpaid: 16, recovered: 2 },
  { date: "05/Mar", registered: "-", collection: 340, cancelled: "-", ignored: 336, negotiating: 10, negotiated: "-", unpaid: 19, recovered: 1 },
  { date: "06/Mar", registered: "-", collection: 341, cancelled: "-", ignored: 332, negotiating: 12, negotiated: 3, unpaid: 20, recovered: 1 },
  { date: "09/Mar", registered: "-", collection: 333, cancelled: "-", ignored: "-", negotiating: 12, negotiated: 1, unpaid: 26, recovered: 2 },
  { date: "10/Mar", registered: "-", collection: 302, cancelled: "-", ignored: 324, negotiating: 13, negotiated: 4, unpaid: 22, recovered: 3 },
];

const columns = [
  "Data",
  "Registradas",
  "Em Cobrança",
  "Cancelado",
  "Ignorado",
  "Em Negociação",
  "Negociado",
  "Neg. s/ Pgto",
  "Recuperado",
];

function CellValue({ value }: { value: string | number }) {
  if (value === "-") return <span className="text-muted-foreground">—</span>;
  const num = Number(value);
  // Highlight ignored and unpaid in destructive
  return <span className="font-mono text-sm">{num.toLocaleString("pt-BR")}</span>;
}

export function DailyTable() {
  return (
    <div className="card-surface overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: "700ms" }}>
      <div className="p-5 pb-0">
        <h3 className="section-title mb-1">Dados Diários</h3>
        <p className="section-subtitle mb-4">Quantidade | Mês Completo</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col}
                  className="sticky top-0 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border transition-colors hover:bg-accent/50",
                  i % 2 === 1 && "bg-muted/30"
                )}
              >
                <td className="px-4 py-2.5 text-sm font-medium text-foreground">{row.date}</td>
                <td className="px-4 py-2.5"><CellValue value={row.registered} /></td>
                <td className="px-4 py-2.5"><CellValue value={row.collection} /></td>
                <td className="px-4 py-2.5"><CellValue value={row.cancelled} /></td>
                <td className="px-4 py-2.5 text-destructive font-medium"><CellValue value={row.ignored} /></td>
                <td className="px-4 py-2.5"><CellValue value={row.negotiating} /></td>
                <td className="px-4 py-2.5"><CellValue value={row.negotiated} /></td>
                <td className="px-4 py-2.5 text-warning font-medium"><CellValue value={row.unpaid} /></td>
                <td className="px-4 py-2.5 text-success font-medium"><CellValue value={row.recovered} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
