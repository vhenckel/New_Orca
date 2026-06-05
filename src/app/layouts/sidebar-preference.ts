const sidebarCollapsedStorageKey = "orca-sidebar-collapsed";

export function readSidebarCollapsedPreference(): boolean {
  if (typeof window === "undefined") return false;

  const stored = window.localStorage.getItem(sidebarCollapsedStorageKey);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return false;
}

export function writeSidebarCollapsedPreference(collapsed: boolean): void {
  window.localStorage.setItem(sidebarCollapsedStorageKey, String(collapsed));
}
