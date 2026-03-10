import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  MessageSquare,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Contatos", path: "/contacts" },
  { icon: FileText, label: "Dívidas", path: "/debts" },
  { icon: Megaphone, label: "Marketing", path: "/marketing" },
  { icon: MessageSquare, label: "Atendimento", path: "/conversations" },
  { icon: ShoppingCart, label: "Vendas", path: "/sales" },
  { icon: Settings, label: "Setup", path: "/settings" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const [active, setActive] = useState("/");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground">
            O2O<span className="text-primary">SPOT</span>
          </span>
        )}
        {collapsed && (
          <span className="mx-auto text-lg font-bold text-primary">O</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setActive(item.path)}
            className={cn(
              "nav-item w-full",
              active === item.path && "nav-item-active",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={onToggle}
          className="nav-item w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
