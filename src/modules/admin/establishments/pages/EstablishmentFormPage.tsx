import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { EstablishmentFormFields } from "@/modules/admin/establishments/components/EstablishmentFormFields";
import { EstablishmentFormSkeleton } from "@/modules/admin/establishments/components/EstablishmentFormSkeleton";
import { EstablishmentProductsTab } from "@/modules/admin/establishments/components/EstablishmentProductsTab";
import { EstablishmentSuppliersTab } from "@/modules/admin/establishments/components/EstablishmentSuppliersTab";
import { useEstablishmentDetailQuery } from "@/modules/admin/establishments/hooks/useEstablishmentDetailQuery";
import { useEstablishmentMutations } from "@/modules/admin/establishments/hooks/useEstablishmentMutations";
import { formatCNPJ } from "@/modules/admin/establishments/lib/cnpj";
import {
  defaultEstablishmentFormValues,
  establishmentFormSchema,
  formValuesToPayload,
  type EstablishmentFormSchemaValues,
} from "@/modules/admin/establishments/lib/establishment-form-schema";
import type { EstablishmentDetail, LinkedUserUpdateScope } from "@/modules/admin/establishments/types";
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

function mapDetailToForm(detail: EstablishmentDetail): EstablishmentFormSchemaValues {
  return {
    name: detail.name,
    cnpj: formatCNPJ(detail.cnpj),
    status: detail.status,
    responsibleName: detail.responsible.name,
    responsibleEmail: detail.responsible.email,
    phone: detail.phone,
    active: detail.active,
    parentEstablishmentId: detail.parentEstablishment?.id ?? "",
    zipCode: detail.address?.zipCode ?? "",
    state: detail.address?.state ?? "",
    city: detail.address?.city ?? "",
    neighborhood: detail.address?.neighborhood ?? "",
    street: detail.address?.street ?? "",
    number: detail.address?.number ?? "",
    complement: detail.address?.complement ?? "",
  };
}

function resolveMode(pathname: string): "create" | "edit" {
  if (pathname.includes("/criar-estabelecimento")) return "create";
  return "edit";
}

export function EstablishmentFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const role = useApiUserRole();

  const mode = resolveMode(location.pathname);
  const isCreate = mode === "create";

  const detailQuery = useEstablishmentDetailQuery(id, { enabled: !isCreate && Boolean(id) });
  const { createMutation, updateMutation, linkSupplierMutation, unlinkSupplierMutation } =
    useEstablishmentMutations();

  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EstablishmentFormSchemaValues | null>(null);

  const form = useForm<EstablishmentFormSchemaValues>({
    resolver: zodResolver(establishmentFormSchema),
    defaultValues: defaultEstablishmentFormValues,
  });

  useEffect(() => {
    if (detailQuery.data) {
      form.reset(mapDetailToForm(detailQuery.data));
    }
  }, [detailQuery.data, form]);

  useEffect(() => {
    if (detailQuery.isError && detailQuery.error instanceof ApiError && detailQuery.error.status === 404) {
      navigate("/404", { replace: true });
    }
  }, [detailQuery.isError, detailQuery.error, navigate]);

  const title = useMemo(() => {
    if (isCreate) return t("modules.admin.establishments.form.title.create");
    return t("modules.admin.establishments.form.title.edit");
  }, [isCreate, t]);

  const submitUpdate = (values: EstablishmentFormSchemaValues, scope?: LinkedUserUpdateScope) => {
    if (!id) return;
    const payload = formValuesToPayload(values);
    updateMutation.mutate(
      {
        id,
        payload: {
          ...payload,
          ...(scope ? { linkedUserUpdateScope: scope } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success(t("modules.admin.establishments.form.toast.updateSuccess"));
          navigate("/estabelecimentos");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError ? error.message : t("modules.admin.establishments.form.toast.updateError");
          toast.error(message);
        },
      },
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    if (isCreate) {
      createMutation.mutate(formValuesToPayload(values), {
        onSuccess: () => {
          toast.success(t("modules.admin.establishments.form.toast.createSuccess"));
          navigate("/estabelecimentos");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError ? error.message : t("modules.admin.establishments.form.toast.createError");
          toast.error(message);
        },
      });
      return;
    }

    const originalEmail = detailQuery.data?.responsible.email ?? "";
    const emailChanged =
      values.responsibleEmail.trim().toLowerCase() !== originalEmail.trim().toLowerCase();
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

  if (role !== "admin") return <Navigate to="/404" replace />;

  if (!isCreate && detailQuery.isLoading) {
    return (
      <DashboardPageLayout showPageHeader title={title}>
        <EstablishmentFormSkeleton />
      </DashboardPageLayout>
    );
  }

  const formCard = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("modules.admin.establishments.form.section.main")}</CardTitle>
      </CardHeader>
      <CardContent>
        <EstablishmentFormFields form={form} excludeEstablishmentId={id} />
      </CardContent>
    </Card>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={title}
      headerActions={
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/estabelecimentos">
              <ArrowLeft className="mr-2 size-4" />
              {t("modules.admin.establishments.form.back")}
            </Link>
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={() => void onSubmit()}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : null}
            {t("modules.admin.establishments.form.save")}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {isCreate ? (
          formCard
        ) : (
          <Tabs defaultValue="establishment">
            <TabsList>
              <TabsTrigger value="establishment">
                {t("modules.admin.establishments.form.tabs.establishment")}
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                {t("modules.admin.establishments.form.tabs.suppliers")}
              </TabsTrigger>
              <TabsTrigger value="products">
                {t("modules.admin.establishments.form.tabs.products")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="establishment" className="mt-4">
              {formCard}
            </TabsContent>
            <TabsContent value="suppliers" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("modules.admin.establishments.form.tabs.suppliers")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {id ? (
                    <EstablishmentSuppliersTab
                      establishmentId={id}
                      isLinking={linkSupplierMutation.isPending}
                      isUnlinking={unlinkSupplierMutation.isPending}
                      onLink={(supplierId) => {
                        linkSupplierMutation.mutate(
                          { establishmentId: id, supplierId },
                          {
                            onSuccess: () =>
                              toast.success(t("modules.admin.establishments.suppliers.toast.linkSuccess")),
                            onError: () =>
                              toast.error(t("modules.admin.establishments.suppliers.toast.linkError")),
                          },
                        );
                      }}
                      onUnlink={(supplierId) => {
                        unlinkSupplierMutation.mutate(
                          { establishmentId: id, supplierId },
                          {
                            onSuccess: () =>
                              toast.success(t("modules.admin.establishments.suppliers.toast.unlinkSuccess")),
                            onError: () =>
                              toast.error(t("modules.admin.establishments.suppliers.toast.unlinkError")),
                          },
                        );
                      }}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="products" className="mt-4" forceMount>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("modules.admin.establishments.form.tabs.products")}
                  </CardTitle>
                </CardHeader>
                <CardContent>{id ? <EstablishmentProductsTab establishmentId={id} /> : null}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </form>

      <Dialog open={scopeDialogOpen} onOpenChange={setScopeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.admin.establishments.form.scopeDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("modules.admin.establishments.form.scopeDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" onClick={() => handleScopeChoice("current")}>
              {t("modules.admin.establishments.form.scopeDialog.current")}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleScopeChoice("all")}>
              {t("modules.admin.establishments.form.scopeDialog.all")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  );
}
