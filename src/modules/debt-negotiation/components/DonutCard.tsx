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
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${((value / total) * 100).toFixed(0)}%`, ""]}
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
