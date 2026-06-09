import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import { toCreateUserPayload } from "@/modules/admin/users/lib/admin-user-mappers";
import {
  adminUserCreateFormSchema,
  defaultAdminUserCreateFormValues,
  type AdminUserCreateFormSchemaValues,
} from "@/modules/admin/users/lib/admin-user-form-schema";
import { useUserMutations } from "@/modules/admin/users/hooks/useUserMutations";
import { ApiError } from "@/shared/api/http-client";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";

export function AdminUserFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const role = useApiUserRole();
  const { createMutation } = useUserMutations();

  const form = useForm<AdminUserCreateFormSchemaValues>({
    resolver: zodResolver(adminUserCreateFormSchema),
    defaultValues: defaultAdminUserCreateFormValues,
  });

  if (role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate(toCreateUserPayload(values), {
      onSuccess: () => {
        toast.success(t("modules.admin.users.form.toast.createSuccess"));
        navigate("/admin/users");
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.admin.users.form.toast.createError");
        toast.error(message);
      },
    });
  });

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.users.form.title.create")}
      subtitle={t("modules.admin.users.description")}
    >
      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="ghost"
          className="w-fit gap-2"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="size-4" />
          {t("modules.admin.users.form.backToList")}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t("modules.admin.users.form.title.create")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <FieldGroup className="max-w-lg gap-4">
                <Field>
                  <FieldLabel htmlFor="create-user-name">{t("modules.admin.users.form.name")}</FieldLabel>
                  <FieldContent>
                    <Input id="create-user-name" {...form.register("name")} />
                    <FieldError errors={[form.formState.errors.name]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="create-user-email">{t("modules.admin.users.form.email")}</FieldLabel>
                  <FieldContent>
                    <Input id="create-user-email" type="email" {...form.register("email")} />
                    <FieldError errors={[form.formState.errors.email]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="create-user-phone">{t("modules.admin.users.form.phone")}</FieldLabel>
                  <FieldContent>
                    <Input id="create-user-phone" {...form.register("phone")} />
                    <FieldError errors={[form.formState.errors.phone]} />
                  </FieldContent>
                </Field>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/users")}>
                    {t("common.actions.cancel")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : null}
                    {t("modules.admin.users.form.create")}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
