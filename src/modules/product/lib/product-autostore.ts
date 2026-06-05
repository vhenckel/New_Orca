import type { ProductFormSchemaValues } from "@/modules/product/lib/product-form-schema";

const STORAGE_PREFIX = "@autostore_product_user=";

export type ProductFormAutostoreMode = "create" | "edit";

function storageKey(userId: string, mode: ProductFormAutostoreMode, entityId?: string): string {
  const suffix = mode === "edit" && entityId ? `_edit_${entityId}` : "_create";
  return `${STORAGE_PREFIX}${userId}${suffix}`;
}

export function readProductFormAutostore(
  userId: string,
  mode: ProductFormAutostoreMode,
  entityId?: string,
): ProductFormSchemaValues | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, mode, entityId));
    if (!raw) return null;
    return JSON.parse(raw) as ProductFormSchemaValues;
  } catch {
    return null;
  }
}

export function writeProductFormAutostore(
  userId: string,
  mode: ProductFormAutostoreMode,
  values: ProductFormSchemaValues,
  entityId?: string,
): void {
  try {
    localStorage.setItem(storageKey(userId, mode, entityId), JSON.stringify(values));
  } catch {
    // ignore
  }
}

export function clearProductFormAutostore(
  userId: string,
  mode: ProductFormAutostoreMode,
  entityId?: string,
): void {
  try {
    localStorage.removeItem(storageKey(userId, mode, entityId));
  } catch {
    // ignore
  }
}

export function hasProductFormAutostore(
  userId: string,
  mode: ProductFormAutostoreMode,
  entityId?: string,
): boolean {
  try {
    return localStorage.getItem(storageKey(userId, mode, entityId)) !== null;
  } catch {
    return false;
  }
}
