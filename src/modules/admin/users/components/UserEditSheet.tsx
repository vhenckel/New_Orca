import { useEffect, useState } from "react";

import type { AdminUser, AdminUserFormValues, AdminUserProfile, AdminUserStatus } from "@/modules/admin/users/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";

const PROFILE_OPTIONS: AdminUserProfile[] = ["establishment", "supplier", "administrative"];
const STATUS_OPTIONS: AdminUserStatus[] = ["active", "inactive"];

interface UserEditSheetProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, values: AdminUserFormValues) => void;
}

function toFormValues(user: AdminUser): AdminUserFormValues {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    profile: user.profile,
    status: user.status,
  };
}

export function UserEditSheet({ user, open, onOpenChange, onSave }: UserEditSheetProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<AdminUserFormValues | null>(null);

  useEffect(() => {
    if (user && open) {
      setForm(toFormValues(user));
    }
  }, [user, open]);

  const handleSave = () => {
    if (!user || !form) return;
    onSave(user.id, form);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{t("modules.admin.users.edit.title")}</SheetTitle>
        </SheetHeader>

        {form ? (
          <FieldGroup className="flex-1 overflow-y-auto py-4">
            <Field>
              <FieldLabel htmlFor="user-name">{t("modules.admin.users.form.name")}</FieldLabel>
              <FieldContent>
                <Input
                  id="user-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="user-email">{t("modules.admin.users.form.email")}</FieldLabel>
              <FieldContent>
                <Input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="user-phone">{t("modules.admin.users.form.phone")}</FieldLabel>
              <FieldContent>
                <Input
                  id="user-phone"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, phone: e.target.value } : prev))}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t("modules.admin.users.form.profile")}</FieldLabel>
              <FieldContent>
                <Select
                  value={form.profile}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, profile: value as AdminUserProfile } : prev,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_OPTIONS.map((profile) => (
                      <SelectItem key={profile} value={profile}>
                        {t(`modules.admin.users.profile.${profile}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>{t("modules.admin.users.form.status")}</FieldLabel>
              <FieldContent>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, status: value as AdminUserStatus } : prev,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`modules.admin.users.status.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>
        ) : null}

        <SheetFooter className="flex flex-row gap-2 border-t border-border pt-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.actions.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={!form}>
            {t("modules.admin.users.edit.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
