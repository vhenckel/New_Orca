import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { SegmentFormFields } from "@/modules/admin/segments/components/SegmentFormFields";
import { SegmentFormSkeleton } from "@/modules/admin/segments/components/SegmentFormSkeleton";
import { useSegmentDetailQuery } from "@/modules/admin/segments/hooks/useSegmentDetailQuery";
import { useSegmentMutations } from "@/modules/admin/segments/hooks/useSegmentMutations";
import {
  clearSegmentFormAutostore,
  readSegmentFormAutostore,
  writeSegmentFormAutostore,
} from "@/modules/admin/segments/lib/segment-autostore";
import {
  defaultSegmentFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapDetailToForm,
  segmentFormSchema,
  type SegmentFormSchemaValues,
} from "@/modules/admin/segments/lib/segment-form-schema";
import type { SegmentListItem } from "@/modules/admin/segments/types";
import { ApiError } from "@/shared/api/http-client";
import { useApiUser, useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { toast } from "@/shared/ui/sonner";

function resolveMode(pathname: string): "create" | "edit" {
  if (pathname.includes("/criar-segmento")) return "create";
  return "edit";
}

export function SegmentFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const role = useApiUserRole();
  const apiUser = useApiUser();
  const autostoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mode = resolveMode(location.pathname);
  const isCreate = mode === "create";
  const stateItem = location.state as SegmentListItem | null;

  const detailQuery = useSegmentDetailQuery(id, {
    enabled: !isCreate && Boolean(id) && !stateItem,
  });
  const { createMutation, updateMutation } = useSegmentMutations();

  const form = useForm<SegmentFormSchemaValues>({
    resolver: zodResolver(segmentFormSchema),
    defaultValues: defaultSegmentFormValues,
  });

  const detailSource = stateItem ?? detailQuery.data;

  useEffect(() => {
    if (!isCreate && detailSource) {
      form.reset(mapDetailToForm(detailSource));
    }
  }, [detailSource, form, isCreate]);

  useEffect(() => {
    if (!apiUser?.id || !isCreate) return;
    const stored = readSegmentFormAutostore(apiUser.id, "create");
    if (stored) form.reset(stored);
  }, [apiUser?.id, form, isCreate]);

  useEffect(() => {
    if (!apiUser?.id || isCreate || !id) return;
    const stored = readSegmentFormAutostore(apiUser.id, "edit", id);
    if (stored && !stateItem) form.reset(stored);
  }, [apiUser?.id, form, id, isCreate, stateItem]);

  useEffect(() => {
    if (!apiUser?.id) return;
    const sub = form.watch((values) => {
      if (autostoreTimer.current) clearTimeout(autostoreTimer.current);
      autostoreTimer.current = setTimeout(() => {
        writeSegmentFormAutostore(apiUser.id, mode, values as SegmentFormSchemaValues, id);
      }, 400);
    });
    return () => {
      sub.unsubscribe();
      if (autostoreTimer.current) clearTimeout(autostoreTimer.current);
    };
  }, [apiUser?.id, form, id, mode]);

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
    if (isCreate) return t("modules.admin.segments.form.title.create");
    return t("modules.admin.segments.form.title.edit");
  }, [isCreate, t]);

  const handleCancel = () => {
    if (apiUser?.id) clearSegmentFormAutostore(apiUser.id, mode, id);
    navigate("/segmentos");
  };

  const onSubmit = form.handleSubmit((values) => {
    if (isCreate) {
      createMutation.mutate(formValuesToCreatePayload(values), {
        onSuccess: () => {
          if (apiUser?.id) clearSegmentFormAutostore(apiUser.id, "create");
          toast.success(t("modules.admin.segments.form.toast.createSuccess"));
          navigate("/segmentos");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : t("modules.admin.segments.form.toast.createError");
          toast.error(message);
        },
      });
      return;
    }

    if (!id) return;
    updateMutation.mutate(
      { id, payload: formValuesToUpdatePayload(values) },
      {
        onSuccess: () => {
          if (apiUser?.id) clearSegmentFormAutostore(apiUser.id, "edit", id);
          toast.success(t("modules.admin.segments.form.toast.updateSuccess"));
          navigate("/segmentos");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : t("modules.admin.segments.form.toast.updateError");
          toast.error(message);
        },
      },
    );
  });

  if (role !== "admin") return <Navigate to="/404" replace />;

  const isLoadingEdit = !isCreate && !stateItem && detailQuery.isLoading;

  if (isLoadingEdit) {
    return (
      <DashboardPageLayout showPageHeader title={title}>
        <SegmentFormSkeleton />
      </DashboardPageLayout>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardPageLayout
      showPageHeader
      title={title}
      headerActions={
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <ArrowLeft className="mr-2 size-4" />
            {t("modules.admin.segments.form.back")}
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={isPending}
            onClick={() => void onSubmit()}
          >
            {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            {t("modules.admin.segments.form.save")}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("modules.admin.segments.form.section.main")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentFormFields form={form} showActive={!isCreate} />
          </CardContent>
        </Card>
      </form>
    </DashboardPageLayout>
  );
}
