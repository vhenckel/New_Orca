import { getDefaultCompanyId, getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { NotificationsResponse } from "@/shared/notifications/types";

const NOTIFICATIONS_PATH = "/trinity/notifications";

export async function fetchNotifications(includeRead = false, companyId?: number): Promise<NotificationsResponse> {
  const id = companyId ?? getDefaultCompanyId();
  const search = new URLSearchParams({
    companyId: String(id),
    includeRead: includeRead ? "true" : "false",
  });
  const url = `${spotApiBaseUrl}${NOTIFICATIONS_PATH}?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Notifications API error: ${res.status}`);
  }
  return res.json();
}

export async function markNotificationRead(notificationId: string, companyId?: number): Promise<{ success: boolean }> {
  const id = companyId ?? getDefaultCompanyId();
  const url = `${spotApiBaseUrl}${NOTIFICATIONS_PATH}/${notificationId}/read?companyId=${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "omit",
    headers: getSpotApiHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Notifications mark-read API error: ${res.status}`);
  }
  return res.json();
}

export async function markAllNotificationsRead(companyId?: number): Promise<{ count: number }> {
  const id = companyId ?? getDefaultCompanyId();
  const url = `${spotApiBaseUrl}${NOTIFICATIONS_PATH}/mark-all-read?companyId=${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "omit",
    headers: getSpotApiHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Notifications mark-all-read API error: ${res.status}`);
  }
  return res.json();
}

