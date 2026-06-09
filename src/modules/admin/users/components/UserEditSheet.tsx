import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { isUserNameEditable, roleToProfile } from "@/modules/admin/users/lib/admin-user-mappers";
import type { AdminUser, AdminUserEditFormValues } from "@/modules/admin/users/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";

interface UserEditSheetProps {
  user: AdminUser | null;
  open: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, values: AdminUserEditFormValues) => void;
}

function toFormValues(user: AdminUser): AdminUserEditFormValues {
  return {
    name: user.name,
    phone: user.phone,
    active: user.status === "active",
  };
}

export function UserEditSheet({
  user,
  open,
  isLoading,
  isSaving,
  onOpenChange,
  onSave,
}: UserEditSheetProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<AdminUserEditFormValues | null>(null);

  useEffect(() => {
    if (user && open) {
      setForm(toFormValues(user));
    }
  }, [user, open]);

  const handleSave = () => {
    if (!user || !form) return;
    onSave(user.id, form);
  };

  const nameEditable = user ? isUserNameEditable(user.role) : false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{t("modules.admin.users.edit.title")}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : form && user ? (
          <FieldGroup className="flex-1 overflow-y-auto py-4">
            <Field>
              <FieldLabel htmlFor="user-name">{t("modules.admin.users.form.name")}</FieldLabel>
              <FieldContent>
                <Input
                  id="user-name"
                  value={form.name}
                  disabled={!nameEditable}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="user-email">{t("modules.admin.users.form.email")}</FieldLabel>
              <FieldContent>
                <Input id="user-email" type="email" value={user.email} disabled readOnly />
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
                <Input
                  value={t(`modules.admin.users.profile.${roleToProfile(user.role)}`)}
                  disabled
                  readOnly
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="user-active">{t("modules.admin.users.form.status")}</FieldLabel>
              <FieldContent>
                <div className="flex items-center gap-3">
                  <Switch
                    id="user-active"
                    checked={form.active}
                    onCheckedChange={(checked) =>
                      setForm((prev) => (prev ? { ...prev, active: checked } : prev))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.active
                      ? t("modules.admin.users.status.active")
                      : t("modules.admin.users.status.inactive")}
                  </span>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>
        ) : null}

        <SheetFooter className="flex flex-row gap-2 border-t border-border pt-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.actions.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={!form || isSaving}>
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {t("modules.admin.users.edit.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
