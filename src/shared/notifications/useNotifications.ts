import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  resolveSessionCompanyId,
} from "@/shared/notifications/services";
import type { NotificationItem, NotificationsResponse } from "@/shared/notifications/types";

function updateCacheAfterRead(prev: NotificationsResponse | undefined, id: string): NotificationsResponse | undefined {
  if (!prev) return prev;
  const notifications = prev.notifications.filter((n) => n.id !== id);
  const unreadCount = Math.max(0, prev.unreadCount - 1);
  return { ...prev, notifications, unreadCount };
}

function updateCacheAfterMarkAll(prev: NotificationsResponse | undefined): NotificationsResponse | undefined {
  if (!prev) return prev;
  return { ...prev, notifications: [], unreadCount: 0 };
}

export function useNotifications() {
  const companyId = resolveSessionCompanyId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", companyId],
    queryFn: () => fetchNotifications(false, companyId),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId, companyId),
    onSuccess: (_result, notificationId) => {
      queryClient.setQueryData<NotificationsResponse>(["notifications", companyId], (prev) =>
        updateCacheAfterRead(prev, notificationId),
      );
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(companyId),
    onSuccess: () => {
      queryClient.setQueryData<NotificationsResponse>(["notifications", companyId], (prev) =>
        updateCacheAfterMarkAll(prev),
      );
    },
  });

  const notifications: NotificationItem[] = query.data?.notifications ?? [];
  const unreadCount = query.data?.unreadCount ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAsRead: (id: string) => markReadMutation.mutate(id),
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: () => markAllMutation.mutate(),
    isMarkingAll: markAllMutation.isPending,
  };
}

