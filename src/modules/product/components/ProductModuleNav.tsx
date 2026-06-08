import { NavLink } from "react-router-dom";

import { useApiUserRole } from "@/shared/auth/use-api-user";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

export function ProductModuleNav() {
  const { t } = useI18n();
  const role = useApiUserRole();

  if (role !== "admin") return null;

  const items = [
    { to: "/products", label: t("modules.product.nav.catalog") },
    { to: "/products/pending", label: t("modules.product.nav.pending") },
  ];

  return (
    <nav
      aria-label={t("modules.product.nav.ariaLabel")}
      className="inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/products"}
          className={({ isActive }) =>
            cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
