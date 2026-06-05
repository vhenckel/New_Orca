import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { SupplierEstablishmentsTab } from "@/modules/suppliers/components/SupplierEstablishmentsTab";
import { SupplierFormFields } from "@/modules/suppliers/components/SupplierFormFields";
import { SupplierFormSkeleton } from "@/modules/suppliers/components/SupplierFormSkeleton";
import { SupplierServiceAreasSection } from "@/modules/suppliers/components/SupplierServiceAreasSection";
import { useSupplierDetailQuery } from "@/modules/suppliers/hooks/useSupplierDetailQuery";
import { useSupplierListSupportQueries } from "@/modules/suppliers/hooks/useSupplierListSupportQueries";
import { useSupplierMutations } from "@/modules/suppliers/hooks/useSupplierMutations";
import {
  defaultSupplierFormValues,
  supplierFormSchema,
  type SupplierFormSchemaValues,
} from "@/modules/suppliers/lib/supplier-form-schema";
import {
  isSupplierFormReadOnly,
  resolveSupplierFormMode,
} from "@/modules/suppliers/lib/supplier-form-mode";
import type { LinkedUserUpdateScope, SupplierDetail } from "@/modules/suppliers/types/supplier-detail";
import { ApiError } from "@/shared/api/http-client";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { toast } from "@/shared/ui/sonner";

function mapDetailToForm(detail: SupplierDetail): SupplierFormSchemaValues {
  return {
    name: detail.name,
    responsibleName: detail.responsible.name,
    responsibleEmail: detail.responsible.email,
    phone: detail.phone,
    minimumOrderValue: detail.minimumOrderValue ?? "",
    segmentIds: detail.segments.map((s) => s.id),
    serviceAreas: detail.serviceAreas ?? [],
  };
}

function toPayload(values: SupplierFormSchemaValues, scope?: LinkedUserUpdateScope) {
  return {
    name: values.name,
    responsible: {
      name: values.responsibleName,
      email: values.responsibleEmail,
    },
    phone: values.phone,
    segmentIds: values.segmentIds,
    minimumOrderValue: values.minimumOrderValue?.trim() || undefined,
    serviceAreas: values.serviceAreas,
    ...(scope ? { linkedUserUpdateScope: scope } : {}),
  };
}

export function SupplierFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const role = useApiUserRole();

  const mode = resolveSupplierFormMode(location.pathname, role);
  const readOnly = isSupplierFormReadOnly(mode);
  const isAdmin = role === "admin";
  const isCreate = mode === "create";

  const detailQuery = useSupplierDetailQuery(id, { enabled: !isCreate && Boolean(id) });
  const { segments } = useSupplierListSupportQueries(role);
  const { createMutation, updateMutation, linkMutation, unlinkMutation } = useSupplierMutations();

  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<SupplierFormSchemaValues | null>(null);
  const [linkedEstablishments, setLinkedEstablishments] = useState<SupplierDetail["establishments"]>([]);

  const form = useForm<SupplierFormSchemaValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: defaultSupplierFormValues,
  });

  useEffect(() => {
    if (detailQuery.data) {
      form.reset(mapDetailToForm(detailQuery.data));
      setLinkedEstablishments(detailQuery.data.establishments ?? []);
    }
  }, [detailQuery.data, form]);

  useEffect(() => {
    if (detailQuery.isError && detailQuery.error instanceof ApiError && detailQuery.error.status === 404) {
      navigate("/404", { replace: true });
    }
  }, [detailQuery.isError, detailQuery.error, navigate]);

  const title = useMemo(() => {
    if (isCreate) return t("modules.suppliers.form.title.create");
    if (mode === "edit") return t("modules.suppliers.form.title.edit");
    return t("modules.suppliers.form.title.view");
  }, [isCreate, mode, t]);

  const submitUpdate = (values: SupplierFormSchemaValues, scope?: LinkedUserUpdateScope) => {
    if (!id) return;
    updateMutation.mutate(
      { id, payload: toPayload(values, scope) },
      {
        onSuccess: () => {
          toast.success(t("modules.suppliers.form.toast.updateSuccess"));
          navigate("/suppliers");
        },
        onError: () => toast.error(t("modules.suppliers.form.toast.updateError")),
      },
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    if (readOnly) return;

    if (isCreate) {
      createMutation.mutate(toPayload(values), {
        onSuccess: () => {
          toast.success(t("modules.suppliers.form.toast.createSuccess"));
          navigate("/suppliers");
        },
        onError: () => toast.error(t("modules.suppliers.form.toast.createError")),
      });
      return;
    }

    const originalEmail = detailQuery.data?.responsible.email ?? "";
    const emailChanged = values.responsibleEmail.trim().toLowerCase() !== originalEmail.trim().toLowerCase();
    const linkedCount = detailQuery.data?.ownerLinkedEntityCount ?? 0;

    if (emailChanged && linkedCount > 1) {
      setPendingValues(values);
      setScopeDialogOpen(true);
      return;
    }

    submitUpdate(values);
  });

  const handleScopeChoice = (scope: LinkedUserUpdateScope) => {
    if (!pendingValues) return;
    setScopeDialogOpen(false);
    submitUpdate(pendingValues, scope);
    setPendingValues(null);
  };

  if (role !== "admin" && role !== "establishment") {
    return <Navigate to="/404" replace />;
  }

  if (!isCreate && detailQuery.isLoading) {
    return (
      <DashboardPageLayout showPageHeader title={title}>
        <SupplierFormSkeleton />
      </DashboardPageLayout>
    );
  }

  const serviceAreas = readOnly ? (detailQuery.data?.serviceAreas ?? []) : form.watch("serviceAreas");

  return (
    <DashboardPageLayout
      showPageHeader
      title={title}
      headerActions={
        readOnly ? (
          <Button type="button" variant="outline" onClick={() => navigate("/suppliers")}>
            {t("modules.suppliers.form.close")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/suppliers">
                <ArrowLeft className="mr-2 size-4" />
                {t("modules.suppliers.form.back")}
              </Link>
            </Button>
            <Button
              type="button"
              className="text-white"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => void onSubmit()}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              {t("modules.suppliers.form.save")}
            </Button>
          </div>
        )
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {isAdmin && !isCreate && detailQuery.data ? (
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span>
              {t("modules.suppliers.form.header.company")}:{" "}
              <strong className="text-foreground">{detailQuery.data.name}</strong>
            </span>
            <span>
              {t("modules.suppliers.form.header.responsible")}:{" "}
              <strong className="text-foreground">{detailQuery.data.responsible.name}</strong>
            </span>
          </div>
        ) : null}

        {isAdmin && !isCreate ? (
          <Tabs defaultValue="supplier">
            <TabsList>
              <TabsTrigger value="supplier">{t("modules.suppliers.form.tabs.supplier")}</TabsTrigger>
              <TabsTrigger value="establishments">
                {t("modules.suppliers.form.tabs.establishments")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="supplier" className="mt-4 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("modules.suppliers.form.section.main")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <SupplierFormFields form={form} segments={segments} readOnly={readOnly} />
                  <SupplierServiceAreasSection
                    areas={serviceAreas}
                    readOnly={readOnly}
                    onChange={(areas) =>
                      form.setValue("serviceAreas", areas, { shouldDirty: true })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="establishments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("modules.suppliers.form.tabs.establishments")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplierEstablishmentsTab
                    establishments={linkedEstablishments}
                    readOnly={readOnly}
                    isLinking={linkMutation.isPending}
                    isUnlinking={unlinkMutation.isPending}
                    onLink={(establishmentId) => {
                      if (!id) return;
                      linkMutation.mutate(
                        { supplierId: id, establishmentId },
                        {
                          onSuccess: () => {
                            void detailQuery.refetch();
                            toast.success(t("modules.suppliers.form.toast.linkSuccess"));
                          },
                          onError: () => toast.error(t("modules.suppliers.form.toast.linkError")),
                        },
                      );
                    }}
                    onUnlink={(establishmentId) => {
                      if (!id) return;
                      unlinkMutation.mutate(
                        { supplierId: id, establishmentId },
                        {
                          onSuccess: () => {
                            setLinkedEstablishments((prev) =>
                              prev.filter((e) => e.id !== establishmentId),
                            );
                            toast.success(t("modules.suppliers.form.toast.unlinkSuccess"));
                          },
                          onError: () => toast.error(t("modules.suppliers.form.toast.unlinkError")),
                        },
                      );
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("modules.suppliers.form.section.main")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <SupplierFormFields form={form} segments={segments} readOnly={readOnly} />
              <SupplierServiceAreasSection
                areas={serviceAreas}
                readOnly={readOnly}
                onChange={
                  readOnly
                    ? undefined
                    : (areas) => form.setValue("serviceAreas", areas, { shouldDirty: true })
                }
              />
            </CardContent>
          </Card>
        )}
      </form>

      <Dialog open={scopeDialogOpen} onOpenChange={setScopeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.suppliers.form.scopeDialog.title")}</DialogTitle>
            <DialogDescription>{t("modules.suppliers.form.scopeDialog.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" onClick={() => handleScopeChoice("current")}>
              {t("modules.suppliers.form.scopeDialog.current")}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleScopeChoice("all")}>
              {t("modules.suppliers.form.scopeDialog.all")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  );
}
