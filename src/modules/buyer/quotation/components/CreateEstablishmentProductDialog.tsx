import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { createEstablishmentProduct } from "@/modules/buyer/quotation/api/establishment-products-api";
import { fetchAllSegments } from "@/modules/buyer/quotation/api/segments-api";
import { formatProductNameTitle } from "@/modules/buyer/quotation/lib/platform-product-display";
import type { EstablishmentProduct } from "@/modules/buyer/quotation/types/create-budget";
import { ApiError } from "@/shared/api/http-client";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "@/shared/ui/sonner";

type CreateEstablishmentProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  establishmentId: string;
  onCreated: (product: EstablishmentProduct) => void;
};

export function CreateEstablishmentProductDialog({
  open,
  onOpenChange,
  productName,
  establishmentId,
  onCreated,
}: CreateEstablishmentProductDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(productName);
  const [unitType, setUnitType] = useState("kg");
  const [segmentId, setSegmentId] = useState("");

  const { data: segments = [], isLoading: segmentsLoading } = useQuery({
    queryKey: ["segments", "all"],
    queryFn: fetchAllSegments,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setName(formatProductNameTitle(productName));
    setUnitType("kg");
    setSegmentId("");
  }, [open, productName]);

  useEffect(() => {
    if (segmentId || segments.length === 0) return;
    setSegmentId(segments[0].id);
  }, [segments, segmentId]);

  const createMutation = useMutation({
    mutationFn: () =>
      createEstablishmentProduct({
        name: name.trim(),
        establishmentId,
        unitType,
        segmentIds: [segmentId],
        brands: [],
      }),
    onSuccess: (created) => {
      toast.success(t("modules.quotation.quotations.create.toastPlatformProductCreated"));
      onCreated(created);
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modules.quotation.quotations.create.toastPlatformProductCreateError");
      toast.error(message);
    },
  });

  function handleSubmit() {
    if (!name.trim()) {
      toast.error(t("modules.quotation.quotations.create.platformCreateNameRequired"));
      return;
    }
    if (!segmentId) {
      toast.error(t("modules.quotation.quotations.create.platformCreateSegmentRequired"));
      return;
    }
    createMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modules.quotation.quotations.create.platformCreateTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-product-name">{t("modules.quotation.quotations.create.platformCreateName")}</Label>
            <Input
              id="new-product-name"
              value={name}
              maxLength={250}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("modules.quotation.quotations.create.platformCreateUnit")}</Label>
            <Select value={unitType} onValueChange={setUnitType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">{t("modules.quotation.quotations.create.platformUnitKg")}</SelectItem>
                <SelectItem value="un">{t("modules.quotation.quotations.create.platformUnitUn")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("modules.quotation.quotations.create.platformCreateSegment")}</Label>
            <Select value={segmentId} onValueChange={setSegmentId} disabled={segmentsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={t("modules.quotation.quotations.create.platformCreateSegment")} />
              </SelectTrigger>
              <SelectContent>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("modules.quotation.quotations.create.cancel")}
          </Button>
          <Button
            type="button"
            className="text-white"
            disabled={createMutation.isPending || segmentsLoading}
            onClick={handleSubmit}
          >
            {createMutation.isPending
              ? t("modules.quotation.quotations.create.saving")
              : t("modules.quotation.quotations.create.platformCreateSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
