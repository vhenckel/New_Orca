import type { ApiUserRole } from "@/shared/auth/types";

export type SupplierFormMode = "create" | "edit" | "view";

export function resolveSupplierFormMode(
  pathname: string,
  role: ApiUserRole | null,
): SupplierFormMode {
  if (pathname.endsWith("/create")) return "create";
  if (pathname.endsWith("/edit")) return "edit";
  if (role === "establishment") return "view";
  return "view";
}

export function isSupplierFormReadOnly(mode: SupplierFormMode): boolean {
  return mode === "view";
}
