import type { SegmentFormSchemaValues } from "@/modules/admin/segments/lib/segment-form-schema";

const STORAGE_PREFIX = "@autostore_segment_user=";

export type SegmentFormAutostoreMode = "create" | "edit";

function storageKey(userId: string, mode: SegmentFormAutostoreMode, entityId?: string): string {
  const suffix = mode === "edit" && entityId ? `_edit_${entityId}` : "_create";
  return `${STORAGE_PREFIX}${userId}${suffix}`;
}

export function readSegmentFormAutostore(
  userId: string,
  mode: SegmentFormAutostoreMode,
  entityId?: string,
): SegmentFormSchemaValues | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, mode, entityId));
    if (!raw) return null;
    return JSON.parse(raw) as SegmentFormSchemaValues;
  } catch {
    return null;
  }
}

export function writeSegmentFormAutostore(
  userId: string,
  mode: SegmentFormAutostoreMode,
  values: SegmentFormSchemaValues,
  entityId?: string,
): void {
  try {
    localStorage.setItem(storageKey(userId, mode, entityId), JSON.stringify(values));
  } catch {
    // ignore
  }
}

export function clearSegmentFormAutostore(
  userId: string,
  mode: SegmentFormAutostoreMode,
  entityId?: string,
): void {
  try {
    localStorage.removeItem(storageKey(userId, mode, entityId));
  } catch {
    // ignore
  }
}

export function hasSegmentFormAutostore(
  userId: string,
  mode: SegmentFormAutostoreMode,
  entityId?: string,
): boolean {
  try {
    return localStorage.getItem(storageKey(userId, mode, entityId)) !== null;
  } catch {
    return false;
  }
}
