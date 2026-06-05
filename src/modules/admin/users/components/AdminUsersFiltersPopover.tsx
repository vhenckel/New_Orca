import { Filter, SlidersHorizontal } from "lucide-react";

import {
  ADMIN_USER_PROFILE_OPTIONS,
  ADMIN_USER_STATUS_OPTIONS,
} from "@/modules/admin/users/lib/admin-users-filters";
import type { AdminUserProfile, AdminUserStatus } from "@/modules/admin/users/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface AdminUsersFiltersPopoverProps {
  statusFilters: AdminUserStatus[];
  profileFilters: AdminUserProfile[];
  onStatusFiltersChange: (next: AdminUserStatus[]) => void;
  onProfileFiltersChange: (next: AdminUserProfile[]) => void;
}

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

export function AdminUsersFiltersPopover({
  statusFilters,
  profileFilters,
  onStatusFiltersChange,
  onProfileFiltersChange,
}: AdminUsersFiltersPopoverProps) {
  const { t } = useI18n();
  const activeCount = statusFilters.length + profileFilters.length;

  const statusSummary =
    statusFilters.length === 0
      ? t("modules.admin.users.filters.statusAll")
      : t("modules.admin.users.filters.statusSelected", { count: statusFilters.length });

  const profileSummary =
    profileFilters.length === 0
      ? t("modules.admin.users.filters.profileAll")
      : t("modules.admin.users.filters.profileSelected", { count: profileFilters.length });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Filter className="size-4" />
          {t("modules.admin.users.filters.advanced")}
          {activeCount > 0 ? (
            <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          {t("modules.admin.users.filters.title")}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("modules.admin.users.filters.statusLabel")}</p>
          {ADMIN_USER_STATUS_OPTIONS.map((status) => (
            <label key={status} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1">
              <Checkbox
                checked={statusFilters.includes(status)}
                onCheckedChange={() => onStatusFiltersChange(toggleItem(statusFilters, status))}
                aria-label={t(`modules.admin.users.status.${status}`)}
              />
              <span className="text-sm">{t(`modules.admin.users.status.${status}`)}</span>
            </label>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">{statusSummary}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onStatusFiltersChange([])}
            >
              {t("modules.admin.users.filters.clearStatus")}
            </Button>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">{t("modules.admin.users.filters.profileLabel")}</p>
          {ADMIN_USER_PROFILE_OPTIONS.map((profile) => (
            <label key={profile} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1">
              <Checkbox
                checked={profileFilters.includes(profile)}
                onCheckedChange={() => onProfileFiltersChange(toggleItem(profileFilters, profile))}
                aria-label={t(`modules.admin.users.profile.${profile}`)}
              />
              <span className="text-sm">{t(`modules.admin.users.profile.${profile}`)}</span>
            </label>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">{profileSummary}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onProfileFiltersChange([])}
            >
              {t("modules.admin.users.filters.clearProfile")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
