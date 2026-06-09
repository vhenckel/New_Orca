import { Filter, SlidersHorizontal } from "lucide-react";

import {
  ADMIN_USER_PROFILE_OPTIONS,
  ADMIN_USER_STATUS_OPTIONS,
} from "@/modules/admin/users/lib/admin-users-filters";
import type { AdminUserProfile } from "@/modules/admin/users/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface AdminUsersFiltersPopoverProps {
  name: string;
  email: string;
  status: string;
  profile: string;
  activeFilterCount: number;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProfileChange: (value: string) => void;
}

export function AdminUsersFiltersPopover({
  name,
  email,
  status,
  profile,
  activeFilterCount,
  onNameChange,
  onEmailChange,
  onStatusChange,
  onProfileChange,
}: AdminUsersFiltersPopoverProps) {
  const { t } = useI18n();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Filter className="size-4" />
          {t("modules.admin.users.filters.advanced")}
          {activeFilterCount > 0 ? (
            <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
              {activeFilterCount}
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
          <p className="text-xs text-muted-foreground">{t("modules.admin.users.form.name")}</p>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t("modules.admin.users.filters.nameAll")}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("modules.admin.users.form.email")}</p>
          <Input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t("modules.admin.users.filters.emailAll")}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("modules.admin.users.filters.statusLabel")}</p>
          <Select value={status || "all"} onValueChange={(value) => onStatusChange(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("modules.admin.users.filters.statusAll")}</SelectItem>
              {ADMIN_USER_STATUS_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`modules.admin.users.status.${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("modules.admin.users.filters.profileLabel")}</p>
          <Select value={profile || "all"} onValueChange={(value) => onProfileChange(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("modules.admin.users.filters.profileAll")}</SelectItem>
              {ADMIN_USER_PROFILE_OPTIONS.map((item: AdminUserProfile) => (
                <SelectItem key={item} value={item}>
                  {t(`modules.admin.users.profile.${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
