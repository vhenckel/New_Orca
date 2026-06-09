import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SupplierCompanyFormFields } from "@/modules/admin/supplier-companies/components/SupplierCompanyFormFields";
import { SupplierCompanyFormSkeleton } from "@/modules/admin/supplier-companies/components/SupplierCompanyFormSkeleton";
import { useSupplierCompanyDetailQuery } from "@/modules/admin/supplier-companies/hooks/useSupplierCompanyDetailQuery";
import { useSupplierCompanyMutations } from "@/modules/admin/supplier-companies/hooks/useSupplierCompanyMutations";
import {
  defaultSupplierCompanyFormValues,
  formValuesToPayload,
  mapDetailToForm,
  supplierCompanyFormSchema,
  type SupplierCompanyFormSchemaValues,
} from "@/modules/admin/supplier-companies/lib/supplier-company-form-schema";
import { fetchAllSegments } from "@/modules/buyer/quotation/api/segments-api";
import { ApiError } from "@/shared/api/http-client";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { toast } from "@/shared/ui/sonner";

type FormValues = Omit<SupplierCompanyFormSchemaValues, "minimumOrderValue"> & {
  minimumOrderValue: string;
};

export function SupplierCompanyFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useApiUserRole();

  const isCreate = !id;
  const detailQuery = useSupplierCompanyDetailQuery(id, {
    enabled: !isCreate && Boolean(id),
  });
  const segmentsQuery = useQuery({
    queryKey: ["segments", "all"],
    queryFn: fetchAllSegments,
    enabled: role === "admin",
  });
  const { createMutation, updateMutation } = useSupplierCompanyMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(supplierCompanyFormSchema),
    defaultValues: defaultSupplierCompanyFormValues,
  });

  useEffect(() => {
    if (!isCreate && detailQuery.data) {
      form.reset(mapDetailToForm(detailQuery.data));
    }
  }, [detailQuery.data, form, isCreate]);

  useEffect(() => {
    if (
      !isCreate &&
      detailQuery.isError &&
      detailQuery.error instanceof ApiError &&
      detailQuery.error.status === 404
    ) {
      navigate("/404", { replace: true });
    }
  }, [detailQuery.isError, detailQuery.error, isCreate, navigate]);

  const title = useMemo(() => {
    if (isCreate) return t("modules.admin.supplierCompanies.form.title.create");
    return t("modules.admin.supplierCompanies.form.title.edit");
  }, [isCreate, t]);

  if (role !== "admin") {
    return <Navigate to="/404" replace />;
  }

  const isLoadingEdit = !isCreate && detailQuery.isLoading;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const payload = formValuesToPayload(values as SupplierCompanyFormSchemaValues);
    if (isCreate) {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("modules.admin.supplierCompanies.form.toast.createSuccess"));
          navigate("/supplier-companies");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : t("modules.admin.supplierCompanies.form.toast.createError");
          toast.error(message);
        },
      });
      return;
    }

    if (!id) return;
    updateMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          toast.success(t("modules.admin.supplierCompanies.form.toast.updateSuccess"));
          navigate("/supplier-companies");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : t("modules.admin.supplierCompanies.form.toast.updateError");
          toast.error(message);
        },
      },
    );
  });

  return (
    <DashboardPageLayout
      showPageHeader
      title={title}
      headerActions={
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/supplier-companies")}>
            <ArrowLeft className="mr-2 size-4" />
            {t("modules.admin.supplierCompanies.form.back")}
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={isPending || isLoadingEdit}
            onClick={() => void onSubmit()}
          >
            {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            {t("modules.admin.supplierCompanies.form.save")}
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEdit ? (
            <SupplierCompanyFormSkeleton />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <SupplierCompanyFormFields
                form={form}
                segments={segmentsQuery.data ?? []}
                selectedSuppliers={detailQuery.data?.suppliers}
              />
            </form>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
