import { ADMIN_DASHBOARD_HEADER, ADMIN_PLAN_SUMMARY } from "@/modules/admin/dashboard/data/adminDashboardMocks";
import { WARNING_BADGE } from "@/shared/lib/status-tones";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

export function AdminDashboardHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-2">
        <Badge
          variant="outline"
          className={WARNING_BADGE}
        >
          {ADMIN_DASHBOARD_HEADER.badge}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {ADMIN_DASHBOARD_HEADER.title}
        </h1>
        <p className="text-sm text-muted-foreground">{ADMIN_DASHBOARD_HEADER.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {ADMIN_PLAN_SUMMARY.map((item) => (
          <Card key={item.label} className="min-w-[180px] border-border/80 shadow-card">
            <CardContent className="flex flex-col gap-1 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
