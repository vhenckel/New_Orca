import { Link } from "react-router-dom";
import { Package, Store } from "lucide-react";

import { AdminChartCard } from "@/modules/admin/dashboard/components/AdminChartCard";
import { RECENT_REGISTRATIONS } from "@/modules/admin/dashboard/data/adminDashboardMocks";
import type { RegistrationType } from "@/modules/admin/dashboard/types";
import { cn } from "@/shared/lib/utils";

function RegistrationIcon({ type }: { type: RegistrationType }) {
  const Icon = type === "restaurant" ? Store : Package;
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        type === "restaurant"
          ? "bg-info/10 text-info"
          : "bg-warning/10 text-warning",
      )}
    >
      <Icon className="size-4" />
    </div>
  );
}

export function RecentRegistrationsCard() {
  return (
    <AdminChartCard
      title="Cadastros recentes"
      subtitle="Últimos a entrar na plataforma"
      headerAction={
        <Link
          to="/admin/restaurants"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver todos &gt;
        </Link>
      }
    >
      <ul className="flex flex-col gap-2">
        {RECENT_REGISTRATIONS.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
          >
            <RegistrationIcon type={item.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.location}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{item.registeredAt}</span>
          </li>
        ))}
      </ul>
    </AdminChartCard>
  );
}
