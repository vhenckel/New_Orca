import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchLastProductValues,
  fetchLastSummary,
  updateBlockStatus,
} from "@/modules/supplier/quotation/api/open-quotations-api";
import { applyLastProductValues } from "@/modules/supplier/quotation/lib/apply-last-product-values";
import { buildSendQuotationPayload } from "@/modules/supplier/quotation/lib/build-send-quotation-payload";
import { isoToDateInputValue } from "@/modules/supplier/quotation/lib/local-date-input";
import {
  createLineResponsesInitial,
  getFixedBrandLabelForLine,
  getItemMaxLineSubtotalBRL,
  getItemPriceLineKeys,
  itemHasAnyPricedLine,
  parseMoneyBRL,
} from "@/modules/supplier/quotation/lib/priceLineKeys";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type SupplierQuotationAlternativeLine,
  type SupplierQuotationCommercialTerms,
  type SupplierQuotationLineResponse,
} from "@/modules/supplier/quotation/lib/supplier-quotation-autostore";
import { validateSendQuotation } from "@/modules/supplier/quotation/lib/validate-send-quotation";
import { useQuotationDetailQuery } from "@/modules/supplier/quotation/hooks/useQuotationDetailQuery";
import { useSendQuotationMutation } from "@/modules/supplier/quotation/hooks/useSendQuotationMutation";
import type { SupplierQuotationDetailItem } from "@/modules/supplier/quotation/types/quotation-detail";
import type { SendQuotationValidationField } from "@/modules/supplier/quotation/lib/validate-send-quotation";
import { useI18n } from "@/shared/i18n/useI18n";
import { toast } from "@/shared/ui/sonner";

type PackagingUnit = "ml" | "l" | "g" | "kg" | "un";

const EMPTY_COMMERCIAL_TERMS: SupplierQuotationCommercialTerms = {
  paymentMethod: "",
  paymentDeadline: "",
  delivery: "",
  quotationValidUntil: "",
};

function isHeaderEmpty(terms: SupplierQuotationCommercialTerms): boolean {
  return (
    !terms.paymentMethod.trim() &&
    !terms.paymentDeadline.trim() &&
    !terms.delivery.trim() &&
    !terms.quotationValidUntil
  );
}

export function useSupplierQuotationEditor(
  quotationId: string | undefined,
  options?: { listPath?: string },
) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const listPath = options?.listPath ?? "/supplier/quotations";

  const { data: detail, isLoading, isError } = useQuotationDetailQuery(quotationId);
  const sendMutation = useSendQuotationMutation(quotationId);

  const [responses, setResponses] = useState<Record<string, SupplierQuotationLineResponse>>({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [commercialTerms, setCommercialTerms] =
    useState<SupplierQuotationCommercialTerms>(EMPTY_COMMERCIAL_TERMS);
  const [alternativeLines, setAlternativeLines] = useState<SupplierQuotationAlternativeLine[]>([]);
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedOverrides, setBlockedOverrides] = useState<Record<string, boolean>>({});
  const [validationField, setValidationField] = useState<SendQuotationValidationField | null>(null);

  const initializedRef = useRef(false);
  const lastSummaryFetchedRef = useRef(false);
  const autostoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergedItems = useMemo((): SupplierQuotationDetailItem[] => {
    if (!detail) return [];
    return detail.items.map((item) => ({
      ...item,
      isBlocked: blockedOverrides[item.id] ?? item.isBlocked,
    }));
  }, [detail, blockedOverrides]);

  const visibleItems = useMemo(
    () => (showBlocked ? mergedItems : mergedItems.filter((item) => !item.isBlocked)),
    [mergedItems, showBlocked],
  );

  const filledItems = useMemo(() => {
    return mergedItems.filter((item) => itemHasAnyPricedLine(item, responses)).length;
  }, [mergedItems, responses]);

  const completionPercent =
    mergedItems.length > 0 ? Math.round((filledItems / mergedItems.length) * 100) : 0;

  const estimatedTotal = useMemo(() => {
    let acc = mergedItems.reduce(
      (sum, item) => sum + getItemMaxLineSubtotalBRL(item, responses),
      0,
    );
    for (const alt of alternativeLines) {
      const parent = mergedItems.find((i) => i.id === alt.parentItemId);
      if (!parent || parent.isBlocked) continue;
      const parsed = parseMoneyBRL(responses[alt.id]?.unitPrice ?? "");
      if (parsed === null) continue;
      acc += parsed * parent.quantity;
    }
    return acc;
  }, [mergedItems, responses, alternativeLines]);

  const estimatedTotalLabel = estimatedTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const persistDraft = useCallback(() => {
    if (!quotationId) return;
    saveDraft(quotationId, {
      responses,
      commercialTerms,
      generalNotes,
      alternativeLines,
    });
  }, [quotationId, responses, commercialTerms, generalNotes, alternativeLines]);

  useEffect(() => {
    initializedRef.current = false;
    lastSummaryFetchedRef.current = false;
    setResponses({});
    setGeneralNotes("");
    setCommercialTerms(EMPTY_COMMERCIAL_TERMS);
    setAlternativeLines([]);
    setShowBlocked(false);
    setBlockedOverrides({});
    setValidationField(null);
  }, [quotationId]);

  useEffect(() => {
    if (!detail || !quotationId || detail.id !== quotationId) return;
    if (initializedRef.current) return;

    const draft = loadDraft(quotationId);
    if (draft) {
      setResponses(draft.responses);
      setCommercialTerms(draft.commercialTerms);
      setGeneralNotes(draft.generalNotes);
      setAlternativeLines(draft.alternativeLines);
    } else {
      setResponses(createLineResponsesInitial(detail.items));
      setGeneralNotes(detail.generalNotes);
      setAlternativeLines([]);
      setCommercialTerms({
        paymentMethod: detail.paymentMethodLabel,
        paymentDeadline: detail.paymentDeadlineLabel,
        delivery: detail.deliveryWindowLabel,
        quotationValidUntil: isoToDateInputValue(detail.quotationValidUntilAt),
      });
    }

    initializedRef.current = true;
  }, [detail, quotationId]);

  useEffect(() => {
    if (!detail || !quotationId || !initializedRef.current || lastSummaryFetchedRef.current) return;
    if (!isHeaderEmpty(commercialTerms)) {
      lastSummaryFetchedRef.current = true;
      return;
    }

    lastSummaryFetchedRef.current = true;
    void (async () => {
      try {
        const summary = await fetchLastSummary(detail.supplierId, detail.establishmentId);
        if (!summary) return;
        setCommercialTerms((prev) => ({
          paymentMethod: prev.paymentMethod || summary.paymentMethod || "",
          paymentDeadline: prev.paymentDeadline || summary.paymentTerm || "",
          delivery: prev.delivery || summary.deliveryDeadline || "",
          quotationValidUntil: prev.quotationValidUntil,
        }));
      } catch {
        // optional prefill
      }
    })();
  }, [detail, quotationId, commercialTerms]);

  useEffect(() => {
    if (!initializedRef.current || !quotationId) return;
    if (autostoreTimerRef.current) clearTimeout(autostoreTimerRef.current);
    autostoreTimerRef.current = setTimeout(() => {
      persistDraft();
    }, 400);
    return () => {
      if (autostoreTimerRef.current) clearTimeout(autostoreTimerRef.current);
    };
  }, [quotationId, responses, commercialTerms, generalNotes, alternativeLines, persistDraft]);

  useEffect(() => {
    if (isError) {
      navigate("/404", { replace: true });
    }
  }, [isError, navigate]);

  const handleUnitPriceChange = useCallback((lineKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [lineKey]: { ...prev[lineKey], unitPrice: value },
    }));
  }, []);

  const handleCustomBrandChange = useCallback((lineKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [lineKey]: { ...prev[lineKey], customBrand: value },
    }));
  }, []);

  const handleObservationChange = useCallback((lineKey: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [lineKey]: { ...prev[lineKey], observation: value },
    }));
  }, []);

  const addAlternativeLine = useCallback(
    (input: {
      parentItemId: string;
      brand: string;
      packagingAmount: string;
      packagingUnit: PackagingUnit;
    }) => {
      const id = `alt-${input.parentItemId}-${crypto.randomUUID()}`;
      setAlternativeLines((prev) => [
        ...prev,
        {
          id,
          parentItemId: input.parentItemId,
          brand: input.brand,
          packagingAmount: input.packagingAmount,
          packagingUnit: input.packagingUnit,
        },
      ]);
      setResponses((prev) => ({
        ...prev,
        [id]: { unitPrice: "", customBrand: "", observation: "" },
      }));
      return id;
    },
    [],
  );

  const removeAlternativeLine = useCallback((alternativeId: string) => {
    setAlternativeLines((prev) => prev.filter((line) => line.id !== alternativeId));
    setResponses((prev) => {
      const next = { ...prev };
      delete next[alternativeId];
      return next;
    });
  }, []);

  const handleSaveDraft = useCallback(() => {
    persistDraft();
    toast.success(t("modules.supplierPortal.quotation.detail.toastDraft"));
  }, [persistDraft, t]);

  const handleSendQuotation = useCallback(async () => {
    if (!detail || !quotationId) return;

    const validation = validateSendQuotation({
      commercialTerms,
      items: mergedItems,
      responses,
      alternativeLines,
    });

    if (!validation.valid) {
      setValidationField(validation.firstInvalidField);
      const firstError = validation.errors[0];
      if (firstError) toast.error(t(firstError.messageKey));
      return;
    }

    setValidationField(null);

    const payload = buildSendQuotationPayload({
      status: "sent",
      items: mergedItems,
      responses,
      alternativeLines,
      paymentMethod: commercialTerms.paymentMethod,
      paymentTerm: commercialTerms.paymentDeadline,
      deliveryDeadline: commercialTerms.delivery,
      expirationDate: commercialTerms.quotationValidUntil,
      observation: generalNotes,
    });

    try {
      await sendMutation.mutateAsync(payload);
      clearDraft(quotationId);
      toast.success(t("modules.supplierPortal.quotation.detail.toastSent"));
      navigate(listPath);
    } catch {
      toast.error(t("modules.supplierPortal.quotation.detail.toastSendError"));
    }
  }, [
    detail,
    quotationId,
    commercialTerms,
    mergedItems,
    responses,
    alternativeLines,
    generalNotes,
    sendMutation,
    navigate,
    listPath,
    t,
  ]);

  const handleNoItems = useCallback(async () => {
    if (!quotationId) return;

    const payload = buildSendQuotationPayload({
      status: "no_offer",
      items: mergedItems,
      responses,
      alternativeLines,
      paymentMethod: commercialTerms.paymentMethod,
      paymentTerm: commercialTerms.paymentDeadline,
      deliveryDeadline: commercialTerms.delivery,
      expirationDate: commercialTerms.quotationValidUntil,
      observation: generalNotes,
    });

    try {
      await sendMutation.mutateAsync(payload);
      clearDraft(quotationId);
      toast.message(t("modules.supplierPortal.quotation.detail.toastNoItems"));
      navigate(listPath);
    } catch {
      toast.error(t("modules.supplierPortal.quotation.detail.toastSendError"));
    }
  }, [
    quotationId,
    mergedItems,
    responses,
    alternativeLines,
    commercialTerms,
    generalNotes,
    sendMutation,
    navigate,
    listPath,
    t,
  ]);

  const handleReusePricesOfDay = useCallback(async () => {
    if (!quotationId) return;
    try {
      const values = await fetchLastProductValues(quotationId);
      if (values.length === 0) {
        toast.message(t("modules.supplierPortal.quotation.detail.toastNoDayPrices"));
        return;
      }
      setResponses((prev) => applyLastProductValues(mergedItems, prev, values));
      toast.success(t("modules.supplierPortal.quotation.detail.toastDayPricesApplied"));
    } catch {
      toast.error(t("modules.supplierPortal.quotation.detail.toastDayPricesError"));
    }
  }, [quotationId, mergedItems, t]);

  const handleToggleBlock = useCallback(
    async (item: SupplierQuotationDetailItem) => {
      if (!detail) return;
      const nextBlocked = !item.isBlocked;

      setBlockedOverrides((prev) => ({ ...prev, [item.id]: nextBlocked }));

      try {
        await updateBlockStatus({
          budgetProductIds: [item.id],
          supplierId: detail.supplierId,
          establishmentId: detail.establishmentId,
          status: nextBlocked,
        });
      } catch {
        setBlockedOverrides((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        toast.error(t("modules.supplierPortal.quotation.detail.toastBlockError"));
      }
    },
    [detail, t],
  );

  return {
    detail,
    isLoading,
    isError,
    responses,
    generalNotes,
    setGeneralNotes,
    commercialTerms,
    setCommercialTerms,
    alternativeLines,
    showBlocked,
    setShowBlocked,
    visibleItems,
    mergedItems,
    filledItems,
    completionPercent,
    estimatedTotal,
    estimatedTotalLabel,
    validationField,
    sendMutation,
    handleUnitPriceChange,
    handleCustomBrandChange,
    handleObservationChange,
    addAlternativeLine,
    removeAlternativeLine,
    handleSaveDraft,
    handleSendQuotation,
    handleNoItems,
    handleReusePricesOfDay,
    handleToggleBlock,
    getFixedBrandLabelForLine,
    getItemPriceLineKeys,
  };
}
