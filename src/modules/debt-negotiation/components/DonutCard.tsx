import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutCardProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  delay?: number;
}

export function DonutCard({ title, data, delay = 0 }: DonutCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="h-28 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  const v = Number(item.value);
                  const safe = Number.isFinite(v) ? v : 0;
                  const pct =
                    total > 0 ? `${((safe / total) * 100).toFixed(0)}%` : "0%";
                  return (
                    <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs shadow-md">
                      <p className="mb-1 font-medium text-foreground">{item.name}</p>
                      <p className="font-mono font-medium tabular-nums text-foreground">{pct}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
