import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Clock,
  Package,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AddPlatformProductDialog } from "@/modules/buyer/quotation/components/AddPlatformProductDialog";
import { BrandSelectBadges } from "@/modules/buyer/quotation/components/BrandSelectBadges";
import { BudgetProductSuppliersDialog } from "@/modules/buyer/quotation/components/BudgetProductSuppliersDialog";
import type { CatalogProduct } from "@/modules/product";
import { patchQuoteAnyBrand } from "@/modules/buyer/quotation/api/establishment-products-api";
import { createBudget, sendBudget, updateBudget } from "@/modules/buyer/quotation/api/budgets-api";
import {
  useBudgetDetail,
  useEstablishmentProductsCatalog,
  useMyEstablishments,
} from "@/modules/buyer/quotation/hooks/useCreateBudgetApis";
import {
  clearCreateBudgetAutostore,
  readCreateBudgetAutostore,
  writeCreateBudgetAutostore,
} from "@/modules/buyer/quotation/lib/create-budget-autostore";
import {
  getCreateBudgetPath,
  getCreateBudgetProductsPath,
} from "@/modules/buyer/quotation/lib/budget-list-navigation";
import {
  brandIdsFromNames,
  buildCreateBudgetPayload,
  buildUpdateBudgetPayload,
  combineDeadlineIso,
  emptyLineFromCatalog,
  formatBudgetLineCollapsedSummary,
  formatPackagingUnit,
  formatProductListSubtitle,
  formatProductListTitle,
  linesFromBudgetDetail,
  parseDeadlineFromIso,
  resolveEditableDeadline,
  toCatalogProduct,
} from "@/modules/buyer/quotation/lib/create-budget-mapper";
import type { EstablishmentProduct } from "@/modules/buyer/quotation/types/create-budget";
import {
  createBudgetFormSchema,
  createBudgetStep1Schema,
} from "@/modules/buyer/quotation/lib/create-budget-schema";
import {
  duplicateProductDisplayNames,
  hasZeroQuantityLines,
  lineBaseProductId,
  lineDuplicateKey,
  normalizeQuantity,
} from "@/modules/buyer/quotation/lib/create-budget-rules";
import { resolveLinesForSubmit } from "@/modules/buyer/quotation/lib/create-budget-submit";
import type { BudgetLineItem } from "@/modules/buyer/quotation/types";
import { getStoredUser } from "@/shared/auth/token-store";
import { ApiError } from "@/shared/api/http-client";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Calendar } from "@/shared/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Checkbox } from "@/shared/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/shared/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/sonner";
import { useI18n } from "@/shared/i18n/useI18n";

function defaultTimeString() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isLineComplete(line: BudgetLineItem, unit: string): boolean {
  const qty = normalizeQuantity(line.quantity, unit);
  const qtyOk = qty !== undefined && qty > 0;
  const brandsOk = line.anyBrand || line.brands.length > 0;
  return qtyOk && brandsOk;
}

type CreateBudgetLocationState = {
  isDuplicate?: boolean;
  budget?: { id: string };
};

export function CreateQuotationPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const userId = getStoredUser()?.id ?? "anonymous";

  const editBudgetId = searchParams.get("edit");
  const duplicateBudgetId = searchParams.get("duplicate");
  const locationState = location.state as CreateBudgetLocationState | null;
  const isDuplicate = Boolean(duplicateBudgetId ?? locationState?.isDuplicate);
  const sourceBudgetId =
    editBudgetId ??
    duplicateBudgetId ??
    (locationState?.isDuplicate ? locationState?.budget?.id ?? null : null);

  const isStep2 = location.pathname.endsWith("/products");
  const step1Path = getCreateBudgetPath(editBudgetId);
  const productsPath = getCreateBudgetProductsPath(editBudgetId);

  const [establishmentId, setEstablishmentId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hydratedFromApi, setHydratedFromApi] = useState(false);
  const [hydratedFromStore, setHydratedFromStore] = useState(false);

  const { data: establishments = [] } = useMyEstablishments();
  const { data: budgetDetail, isSuccess: budgetDetailLoaded } = useBudgetDetail(sourceBudgetId);

  const catalogEstablishmentId =
    establishmentId || budgetDetail?.establishment.id || null;
  const shouldFetchCatalog =
    isStep2 || Boolean(sourceBudgetId && budgetDetailLoaded);

  const {
    catalog: catalogProducts,
    byCompositeId,
    brandIdByCompositeAndName,
    byBaseId,
    isLoading: catalogLoading,
    isFetching: catalogFetching,
    isError: catalogError,
  } = useEstablishmentProductsCatalog(catalogEstablishmentId, shouldFetchCatalog);

  const budgetStatus = budgetDetail?.status;
  const isReadOnly = budgetStatus === "finished";
  const isOpenLimited = budgetStatus === "open";
  const canSend = !isReadOnly && !isOpenLimited;

  const productById = useMemo(
    () => new Map(catalogProducts.map((p) => [p.id, p])),
    [catalogProducts],
  );

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(() => new Date());
  const [deadlineTime, setDeadlineTime] = useState(defaultTimeString);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [observations, setObservations] = useState("");
  const deadlineTimeRef = useRef<HTMLInputElement>(null);

  const [lineItems, setLineItems] = useState<Record<string, BudgetLineItem>>({});
  /** Ordem de inclusão: novos itens sempre no final. */
  const [lineOrder, setLineOrder] = useState<string[]>([]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [showLineValidation, setShowLineValidation] = useState(false);

  const [productQuery, setProductQuery] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [draftLine, setDraftLine] = useState<BudgetLineItem | null>(null);
  const productPickerRef = useRef<HTMLDivElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const draftQtyRef = useRef<HTMLInputElement>(null);
  const prevSourceBudgetIdRef = useRef<string | null>(null);

  const [lineNameFilter, setLineNameFilter] = useState("");
  const [lineSegmentFilter, setLineSegmentFilter] = useState("");
  const [confirmZeroQtyOpen, setConfirmZeroQtyOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [confirmSameBaseOpen, setConfirmSameBaseOpen] = useState(false);
  const [pendingAddProduct, setPendingAddProduct] = useState<{
    product: CatalogProduct;
    line: BudgetLineItem;
  } | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<"save" | "send" | null>(null);
  const [suppliersDialog, setSuppliersDialog] = useState<{
    productId: string;
    productName: string;
  } | null>(null);
  const [platformProductDialogOpen, setPlatformProductDialogOpen] = useState(false);

  const addedIds = useMemo(() => new Set(Object.keys(lineItems)), [lineItems]);

  const availableProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const base = catalogProducts.filter((p) => !addedIds.has(p.id));
    if (!q) return base;
    return base.filter((p) => {
      const source = byCompositeId.get(p.id);
      const establishmentName = source?.establishment.name?.toLowerCase() ?? "";
      return (
        p.name.toLowerCase().includes(q) ||
        establishmentName.includes(q) ||
        p.brands.some((brand) => brand.toLowerCase().includes(q)) ||
        formatPackagingUnit(p.packagingUnit).toLowerCase().includes(q)
      );
    });
  }, [productQuery, addedIds, catalogProducts, byCompositeId]);

  const canAddFromPlatform = !catalogLoading && !isReadOnly && !isOpenLimited;

  const linesArray = useMemo(() => {
    return lineOrder.map((id) => lineItems[id]).filter(Boolean);
  }, [lineOrder, lineItems]);

  const lineSegmentOptions = useMemo(() => {
    const segments = new Set<string>();
    for (const line of linesArray) {
      const product = productById.get(line.productId);
      if (product?.categoryLabel) segments.add(product.categoryLabel);
    }
    return [...segments].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [linesArray, productById]);

  const filteredLinesArray = useMemo(() => {
    const nameQ = lineNameFilter.trim().toLowerCase();
    const segmentQ = lineSegmentFilter.trim().toLowerCase();
    return linesArray.filter((line) => {
      const product = productById.get(line.productId);
      if (!product) return false;
      if (nameQ && !product.name.toLowerCase().includes(nameQ)) return false;
      if (segmentQ && !product.categoryLabel.toLowerCase().includes(segmentQ)) return false;
      return true;
    });
  }, [linesArray, lineNameFilter, lineSegmentFilter, productById]);

  const availableCount = catalogProducts.length - addedIds.size;

  const deadlineCalendarRange = useMemo(() => {
    const today = startOfDay(new Date());
    const defaultMax = startOfDay(addDays(today, 2));
    const isEditingSaved = Boolean(editBudgetId) && budgetStatus === "saved" && !isDuplicate;

    if (isEditingSaved && deadlineDate) {
      const selected = startOfDay(deadlineDate);
      return {
        from: today,
        to: selected > defaultMax ? selected : defaultMax,
      };
    }

    return { from: today, to: defaultMax };
  }, [deadlineDate, editBudgetId, budgetStatus, isDuplicate]);

  function addProductFromDraft(p: CatalogProduct, line: BudgetLineItem) {
    const isNew = !lineItems[p.id];
    setLineItems((prev) => ({
      ...prev,
      [p.id]: prev[p.id] ?? line,
    }));
    if (isNew) {
      setLineOrder((prev) => [...prev, p.id]);
      setExpandedProductId(p.id);
      setLastAddedProductId(p.id);
    }
  }

  function removeProduct(productId: string) {
    setLineItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setLineOrder((prev) => prev.filter((id) => id !== productId));
    if (expandedProductId === productId) setExpandedProductId(null);
  }

  function clearAll() {
    setLineItems({});
    setLineOrder([]);
    setExpandedProductId(null);
    setLastAddedProductId(null);
    setShowLineValidation(false);
  }

  function updateLine(productId: string, patch: Partial<BudgetLineItem>) {
    setLineItems((prev) => {
      const cur = prev[productId];
      if (!cur) return prev;
      return { ...prev, [productId]: { ...cur, ...patch } };
    });
  }

  function patchLineBrands(productId: string, brandNames: string[]) {
    updateLine(productId, {
      brands: brandNames,
      brandIds: brandIdsFromNames(productId, brandNames, brandIdByCompositeAndName),
    });
  }

  function handleCancel() {
    clearCreateBudgetAutostore(userId);
    navigate("/quotations");
  }

  function validateStep1(): boolean {
    const parsed = createBudgetStep1Schema.safeParse({
      establishmentId,
      deadlineDate,
      deadlineTime,
      deliveryTime: deliveryTime.trim() || undefined,
      observation: observations.trim() || null,
    });
    if (!parsed.success) {
      if (!establishmentId) {
        toast.error(t("modules.quotation.quotations.create.validationEstablishment"));
      } else {
        toast.error(t("modules.quotation.quotations.create.validationDeadline"));
      }
      return false;
    }
    return true;
  }

  function handleNextFromStep1() {
    if (!validateStep1()) return;
    navigate(productsPath);
  }

  function validateLinesForSubmit(): BudgetLineItem[] | null {
    const schemaItems = linesArray.map((line) => ({
      productId: line.productId,
      baseProductId: line.baseProductId,
      quantity: line.quantity,
      brandIds: line.anyBrand ? [] : (line.brandIds ?? []),
      anyBrand: line.anyBrand,
      note: line.note,
    }));
    const parsed = createBudgetFormSchema.safeParse({
      establishmentId,
      deadlineDate,
      deadlineTime,
      deliveryTime: deliveryTime.trim() || undefined,
      observation: observations.trim() || null,
      items: schemaItems,
    });
    if (!parsed.success) {
      return null;
    }

    const dupNames = duplicateProductDisplayNames(linesArray, productById);
    if (dupNames.length > 0) {
      toast.error(t("modules.quotation.quotations.create.toastDuplicateBlocked"), {
        description: t("modules.quotation.quotations.create.toastDuplicateDetail", {
          names: dupNames.join(", "),
        }),
      });
      return null;
    }

    const withQuantity = linesArray.filter((line) => {
      const unit = productById.get(line.productId)?.unit ?? "un";
      const qty = normalizeQuantity(line.quantity, unit);
      return qty !== undefined && qty > 0;
    });

    const incomplete = withQuantity.filter((line) => {
      const unit = productById.get(line.productId)?.unit ?? "un";
      return !isLineComplete(line, unit);
    });

    if (incomplete.length > 0) {
      setShowLineValidation(true);
      toast.error(t("modules.quotation.quotations.create.validationLineIncomplete"));
      const firstId = incomplete[0]?.productId;
      if (firstId) {
        setExpandedProductId(firstId);
        requestAnimationFrame(() => {
          document.getElementById(`budget-line-${firstId}`)?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        });
      }
      return null;
    }

    setShowLineValidation(false);
    return linesArray;
  }

  async function persistBudget(lines: BudgetLineItem[]): Promise<string> {
    const catalogSource = byCompositeId.size > 0 ? [...byCompositeId.values()] : [];
    const resolved = await resolveLinesForSubmit(lines, catalogSource);

    if (editBudgetId && !isDuplicate) {
      await updateBudget(
        editBudgetId,
        buildUpdateBudgetPayload(
          deadlineDate!,
          deadlineTime,
          deliveryTime,
          observations,
          resolved,
        ),
      );
      return editBudgetId;
    }

    const created = await createBudget(
      buildCreateBudgetPayload(
        establishmentId,
        deadlineDate!,
        deadlineTime,
        deliveryTime,
        observations,
        resolved,
      ),
    );
    return created.id;
  }

  function requestSubmit(mode: "save" | "send") {
    if (isReadOnly) return;
    const lines = validateLinesForSubmit();
    if (!lines) {
      toast.error(
        mode === "send"
          ? t("modules.quotation.quotations.create.toastValidationSend")
          : t("modules.quotation.quotations.create.toastValidationSave"),
      );
      return;
    }
    if (hasZeroQuantityLines(lines)) {
      setPendingSubmit(mode);
      setConfirmZeroQtyOpen(true);
      return;
    }
    void executeSubmit(mode, lines);
  }

  async function executeSubmit(mode: "save" | "send", lines: BudgetLineItem[]) {
    const setLoading = mode === "send" ? setIsSending : setIsSaving;
    setLoading(true);
    try {
      const budgetId = await persistBudget(lines);
      if (mode === "send") {
        await sendBudget(budgetId);
        toast.success(t("modules.quotation.quotations.create.toastSent"));
      } else {
        toast.success(
          editBudgetId && !isDuplicate
            ? t("modules.quotation.quotations.create.toastUpdated")
            : t("modules.quotation.quotations.create.toastSuccess"),
        );
      }
      clearCreateBudgetAutostore(userId);
      navigate("/quotations");
    } catch (error) {
      const fallback =
        mode === "send"
          ? t("modules.quotation.quotations.create.toastSendError")
          : t("modules.quotation.quotations.create.toastSaveError");
      const message = error instanceof ApiError ? error.message : fallback;
      toast.error(message);
    } finally {
      setLoading(false);
      setPendingSubmit(null);
    }
  }

  function handleSave() {
    requestSubmit("save");
  }

  function handleSend() {
    setConfirmSendOpen(true);
  }

  function confirmSend() {
    setConfirmSendOpen(false);
    requestSubmit("send");
  }

  function addAllCatalogProducts() {
    if (isReadOnly || isOpenLimited) return;
    const newItems = { ...lineItems };
    const newOrder = [...lineOrder];
    for (const product of catalogProducts) {
      if (newItems[product.id]) continue;
      const source = byCompositeId.get(product.id);
      newItems[product.id] = { ...emptyLineFromCatalog(product, source), quantity: 0 };
      newOrder.push(product.id);
    }
    setLineItems(newItems);
    setLineOrder(newOrder);
  }

  function clearZeroQuantityLines() {
    const nextItems: Record<string, BudgetLineItem> = {};
    const nextOrder: string[] = [];
    for (const id of lineOrder) {
      const line = lineItems[id];
      if (!line) continue;
      const unit = productById.get(id)?.unit ?? "un";
      const qty = normalizeQuantity(line.quantity, unit);
      if (qty === 0) continue;
      nextItems[id] = line;
      nextOrder.push(id);
    }
    setLineItems(nextItems);
    setLineOrder(nextOrder);
  }

  async function applyQuoteAnyBrand(
    line: BudgetLineItem,
    compositeId: string,
    checked: boolean,
  ) {
    const establishmentProductId =
      line.establishmentProductId ?? byCompositeId.get(compositeId)?.establishmentProductId;
    if (establishmentProductId) {
      try {
        await patchQuoteAnyBrand(establishmentProductId, checked);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : t("modules.quotation.quotations.create.toastSaveError");
        toast.error(message);
        return;
      }
    }
    updateLine(compositeId, {
      anyBrand: checked,
      brands: checked ? [] : line.brands,
      brandIds: checked ? [] : line.brandIds,
    });
  }

  function openTimePicker(input: HTMLInputElement | null) {
    if (!input) return;
    if ("showPicker" in input) {
      input.showPicker();
      return;
    }
    input.focus();
  }

  function setAllBrands(productId: string, brands: string[], selected: boolean) {
    patchLineBrands(productId, selected ? brands : []);
  }

  function toggleBrand(productId: string, brand: string, selected: boolean) {
    setLineItems((prev) => {
      const cur = prev[productId];
      if (!cur) return prev;
      const exists = cur.brands.includes(brand);
      if (selected && exists) return prev;
      if (!selected && !exists) return prev;
      const nextBrands = selected ? [...cur.brands, brand] : cur.brands.filter((b) => b !== brand);
      const next = {
        ...cur,
        brands: nextBrands,
        brandIds: brandIdsFromNames(productId, nextBrands, brandIdByCompositeAndName),
      };
      return { ...prev, [productId]: next };
    });
  }

  function patchDraftBrands(productId: string, brandNames: string[]) {
    setDraftLine((cur) => {
      if (!cur) return cur;
      return {
        ...cur,
        brands: brandNames,
        brandIds: brandIdsFromNames(productId, brandNames, brandIdByCompositeAndName),
      };
    });
  }

  function setAllDraftBrands(productId: string, brands: string[], selected: boolean) {
    patchDraftBrands(productId, selected ? brands : []);
  }

  function toggleDraftBrand(productId: string, brand: string, selected: boolean) {
    setDraftLine((cur) => {
      if (!cur) return cur;
      const exists = cur.brands.includes(brand);
      if (selected && exists) return cur;
      if (!selected && !exists) return cur;
      const nextBrands = selected ? [...cur.brands, brand] : cur.brands.filter((b) => b !== brand);
      return {
        ...cur,
        brands: nextBrands,
        brandIds: brandIdsFromNames(productId, nextBrands, brandIdByCompositeAndName),
      };
    });
  }

  function selectProduct(p: CatalogProduct, sourceOverride?: EstablishmentProduct) {
    const source = sourceOverride ?? byCompositeId.get(p.id);
    setProductDropdownOpen(false);
    setSelectedProductId(p.id);
    setDraftLine(emptyLineFromCatalog(p, source));
    requestAnimationFrame(() => {
      const el = draftQtyRef.current;
      if (!el) return;
      el.focus();
      el.select();
    });
  }

  async function handlePlatformProductAdded(establishmentProduct: EstablishmentProduct) {
    await queryClient.invalidateQueries({
      queryKey: ["establishment-products", "all", establishmentId],
    });
    const catalogProduct = toCatalogProduct(establishmentProduct);
    selectProduct(catalogProduct, establishmentProduct);
  }

  function clearSelection() {
    setSelectedProductId(null);
    setDraftLine(null);
    setProductDropdownOpen(true);
    requestAnimationFrame(() => {
      productSearchRef.current?.focus();
    });
  }

  function commitAddProduct(p: CatalogProduct, line: BudgetLineItem) {
    addProductFromDraft(p, line);
    setProductQuery("");
    setSelectedProductId(null);
    setDraftLine(null);
    setProductDropdownOpen(true);
    requestAnimationFrame(() => {
      productSearchRef.current?.focus();
    });
  }

  function addSelectedToBudget() {
    if (!selectedProductId || !draftLine || isReadOnly) return;
    const p = productById.get(selectedProductId);
    if (!p) return;

    const newKey = lineDuplicateKey(draftLine);
    if (linesArray.some((line) => lineDuplicateKey(line) === newKey)) {
      toast.error(t("modules.quotation.quotations.create.toastProductAlreadyAdded"));
      return;
    }

    const baseId = lineBaseProductId(draftLine);
    const sameBaseOther = linesArray.some(
      (line) => lineBaseProductId(line) === baseId && lineDuplicateKey(line) !== newKey,
    );
    if (sameBaseOther) {
      setPendingAddProduct({ product: p, line: draftLine });
      setConfirmSameBaseOpen(true);
      return;
    }

    commitAddProduct(p, draftLine);
  }

  useEffect(() => {
    if (!lastAddedProductId) return;
    const el = document.getElementById(`budget-line-${lastAddedProductId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lastAddedProductId, linesArray.length]);

  useEffect(() => {
    if (!showLineValidation) return;
    const allComplete = linesArray.every((line) => {
      const unit = productById.get(line.productId)?.unit ?? "un";
      return isLineComplete(line, unit);
    });
    if (linesArray.length > 0 && allComplete) {
      setShowLineValidation(false);
    }
  }, [showLineValidation, linesArray, productById]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const root = productPickerRef.current;
      if (!root) return;
      const target = e.target as Node | null;
      if (target && root.contains(target)) return;
      setProductDropdownOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const showProductList = productDropdownOpen && !selectedProductId;

  useEffect(() => {
    if (establishments.length !== 1 || establishmentId) return;
    setEstablishmentId(establishments[0].id);
  }, [establishments, establishmentId]);

  useEffect(() => {
    const prev = prevSourceBudgetIdRef.current;
    prevSourceBudgetIdRef.current = sourceBudgetId;
    if (prev === null || prev === sourceBudgetId) return;
    setHydratedFromApi(false);
    setLineItems({});
    setLineOrder([]);
  }, [sourceBudgetId]);

  useEffect(() => {
    if (hydratedFromStore || hydratedFromApi || sourceBudgetId) return;
    const saved = readCreateBudgetAutostore(userId);
    if (!saved) {
      setHydratedFromStore(true);
      return;
    }
    if (saved.step === 2) {
      navigate(getCreateBudgetProductsPath(editBudgetId), { replace: true });
    }
    setEstablishmentId(saved.establishmentId);
    if (saved.deadlineDateIso) {
      const deadlineIso = combineDeadlineIso(new Date(saved.deadlineDateIso), saved.deadlineTime);
      const { date, time } = resolveEditableDeadline(deadlineIso);
      setDeadlineDate(date);
      setDeadlineTime(time);
    }
    setDeliveryTime(saved.deliveryTime);
    setObservations(saved.observations);
    setLineItems(saved.lineItems);
    setLineOrder(saved.lineOrder);
    setHydratedFromStore(true);
  }, [hydratedFromStore, hydratedFromApi, sourceBudgetId, userId, editBudgetId, navigate]);

  useEffect(() => {
    if (!isStep2) return;
    if (sourceBudgetId && !hydratedFromApi) return;
    if (!sourceBudgetId && !hydratedFromStore) return;
    const parsed = createBudgetStep1Schema.safeParse({
      establishmentId,
      deadlineDate,
      deadlineTime,
      deliveryTime: deliveryTime.trim() || undefined,
      observation: observations.trim() || null,
    });
    if (!parsed.success) {
      navigate(step1Path, { replace: true });
    }
  }, [
    isStep2,
    sourceBudgetId,
    hydratedFromApi,
    hydratedFromStore,
    step1Path,
    navigate,
    establishmentId,
    deadlineDate,
    deadlineTime,
    deliveryTime,
    observations,
  ]);

  useEffect(() => {
    if (!sourceBudgetId || !budgetDetailLoaded || !budgetDetail || hydratedFromApi) return;

    const budgetHasItems = budgetDetail.items.length > 0;
    const estId = budgetDetail.establishment.id;

    if (!establishmentId && estId) {
      setEstablishmentId(estId);
    }

    if (budgetHasItems) {
      const catalogEst = establishmentId || estId;
      if (!catalogEst) return;
      if (catalogLoading || catalogFetching) return;
    }

    if (!isDuplicate) {
      const { date, time } =
        budgetDetail.status === "saved"
          ? resolveEditableDeadline(budgetDetail.deadline, budgetDetail.createdAt)
          : parseDeadlineFromIso(budgetDetail.deadline);
      setDeadlineDate(date);
      setDeadlineTime(time);
    }
    if (budgetDetail.deliveryTime) setDeliveryTime(budgetDetail.deliveryTime);
    setObservations(budgetDetail.observation ?? "");

    if (budgetHasItems) {
      const mapped = linesFromBudgetDetail(budgetDetail, byBaseId);
      setLineItems(mapped.lines);
      setLineOrder(mapped.order);
    }

    setHydratedFromApi(true);
  }, [
    sourceBudgetId,
    budgetDetailLoaded,
    budgetDetail,
    hydratedFromApi,
    isDuplicate,
    establishmentId,
    catalogProducts.length,
    catalogLoading,
    catalogFetching,
    catalogError,
    byBaseId,
  ]);

  useEffect(() => {
    if (isDuplicate || sourceBudgetId) return;
    const timer = window.setTimeout(() => {
      writeCreateBudgetAutostore(userId, {
        step: isStep2 ? 2 : 1,
        establishmentId,
        deadlineDateIso: deadlineDate?.toISOString() ?? null,
        deadlineTime,
        deliveryTime,
        observations,
        lineItems,
        lineOrder,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    isStep2,
    establishmentId,
    deadlineDate,
    deadlineTime,
    deliveryTime,
    observations,
    lineItems,
    lineOrder,
    userId,
    isDuplicate,
    sourceBudgetId,
  ]);

  useEffect(() => {
    if (catalogError) {
      toast.error(t("modules.quotation.quotations.create.toastCatalogError"));
    }
  }, [catalogError, t]);

  if (!isStep2) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("modules.quotation.quotations.create.step1Title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("modules.quotation.quotations.create.deadlineDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadlineDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {deadlineDate
                        ? format(deadlineDate, "PPP", { locale: ptBR })
                        : t("modules.quotation.quotations.create.pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadlineDate}
                      onSelect={setDeadlineDate}
                      locale={ptBR}
                      disabled={{
                        before: deadlineCalendarRange.from,
                        after: deadlineCalendarRange.to,
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline-time">{t("modules.quotation.quotations.create.deadlineTime")}</Label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 z-10 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => openTimePicker(deadlineTimeRef.current)}
                    aria-label={t("modules.quotation.quotations.create.deadlineTime")}
                  >
                    <Clock className="size-4" />
                  </Button>
                  <Input
                    ref={deadlineTimeRef}
                    id="deadline-time"
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-time">{t("modules.quotation.quotations.create.deliveryTime")}</Label>
                <Input
                  id="delivery-time"
                  value={deliveryTime}
                  maxLength={250}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder={t("modules.quotation.quotations.create.deliveryTimePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">{t("modules.quotation.quotations.create.observations")}</Label>
              <Textarea
                id="obs"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder={t("modules.quotation.quotations.create.observationsPlaceholder")}
                rows={4}
                maxLength={250}
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t bg-muted/30 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            <Button type="button" onClick={handleNextFromStep1} className="text-white">
              {t("modules.quotation.quotations.create.next")}
            </Button>
          </CardFooter>
        </Card>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      showPageHeader={false}
      className="min-h-[calc(100dvh-6.5rem)] overflow-hidden lg:h-[calc(100dvh-6.5rem)] lg:min-h-0"
      headerContent={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => navigate(step1Path)}
                aria-label={t("modules.quotation.quotations.create.back")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {t("modules.quotation.quotations.create.step2Title")}
              </h1>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              {t("modules.quotation.quotations.create.step2Subtitle", {
                count: linesArray.length,
              })}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 pl-10 sm:pl-0">
            {isReadOnly ? (
              <p className="text-sm text-muted-foreground">
                {t("modules.quotation.quotations.create.readOnlyHint")}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving || isSending}
            >
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            {!isReadOnly ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave()}
                  disabled={isSaving || isSending || catalogLoading}
                >
                  {isSaving
                    ? t("modules.quotation.quotations.create.saving")
                    : t("modules.quotation.quotations.create.save")}
                </Button>
                {canSend ? (
                  <Button
                    type="button"
                    className="gap-1 text-white"
                    onClick={() => handleSend()}
                    disabled={isSaving || isSending || catalogLoading}
                  >
                    {isSending
                      ? t("modules.quotation.quotations.create.sending")
                      : t("modules.quotation.quotations.create.send")}
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        <Card className="flex min-h-0 flex-1 flex-col lg:col-span-6">
          <CardHeader className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2 space-y-0 p-6 pb-3">
            <CardTitle className="text-base">{t("modules.quotation.quotations.create.availableTitle")}</CardTitle>
            {!isReadOnly && !isOpenLimited ? (
              <Button type="button" variant="outline" size="sm" onClick={addAllCatalogProducts}>
                {t("modules.quotation.quotations.create.addAllProducts")}
              </Button>
            ) : (
              <span className="h-9 min-w-[7.25rem] shrink-0 sm:min-w-[8.5rem]" aria-hidden />
            )}
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
            <div ref={productPickerRef} className="flex min-h-0 flex-1 flex-col px-6">
              <Command
                shouldFilter={false}
                className="flex min-h-0 flex-1 flex-col overflow-visible rounded-none border-0 bg-transparent [&_[cmdk-group]]:p-0 [&_[cmdk-input-wrapper]]:px-0"
              >
                <CommandInput
                  ref={productSearchRef}
                  value={productQuery}
                  onValueChange={setProductQuery}
                  onFocus={() => !isReadOnly && !isOpenLimited && setProductDropdownOpen(true)}
                  disabled={isReadOnly || isOpenLimited}
                  placeholder={t("modules.quotation.quotations.create.searchProducts")}
                  className="shrink-0"
                />
                {selectedProductId && draftLine && !isReadOnly && !isOpenLimited ? (
              <div className="shrink-0 overflow-visible border-b bg-card py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {(() => {
                      const selected = productById.get(selectedProductId);
                      const source = byCompositeId.get(selectedProductId);
                      if (!selected) return null;
                      return (
                        <>
                          <p className="truncate text-sm font-semibold text-foreground">
                            {formatProductListTitle(selected.name)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatProductListSubtitle(selected, {
                              quoteAnyBrand: source?.quoteAnyBrand,
                            })}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={clearSelection} aria-label="Limpar seleção">
                    <span aria-hidden>×</span>
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)]">
                  <Label className="text-xs">{t("modules.quotation.quotations.create.qty")}</Label>
                  <Label htmlFor="draft-any-brand" className="text-xs">
                    {t("modules.quotation.quotations.create.anyBrand")}
                  </Label>
                  <Label className="text-xs">{t("modules.quotation.quotations.create.selectBrand")}</Label>

                  <div className="flex items-center gap-2 py-0.5">
                    <Input
                      ref={draftQtyRef}
                      type="number"
                      min={0}
                      step={(() => {
                        const unit = productById.get(selectedProductId)?.unit ?? "un";
                        return unit.toLowerCase() === "un" ? 1 : 0.0001;
                      })()}
                      className="w-20 focus-visible:ring-offset-0"
                      value={draftLine.quantity}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        const unit = productById.get(selectedProductId)?.unit ?? "un";
                        const normalized = normalizeQuantity(n, unit);
                        setDraftLine((cur) => {
                          if (!cur) return cur;
                          return {
                            ...cur,
                            quantity: normalized ?? 0,
                          };
                        });
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {productById.get(selectedProductId)?.unit}
                    </span>
                  </div>

                  {(() => {
                    const p = productById.get(selectedProductId);
                    if (!p) return null;
                    const isAllBrandsSelected = p.brands.length > 0 && draftLine.brands.length === p.brands.length;
                    return (
                      <>
                        <div className="flex items-center justify-center">
                          <Switch
                            id="draft-any-brand"
                            checked={draftLine.anyBrand}
                            onCheckedChange={(checked) => {
                              void (async () => {
                                const estId =
                                  draftLine.establishmentProductId ??
                                  byCompositeId.get(selectedProductId)?.establishmentProductId;
                                if (estId) {
                                  try {
                                    await patchQuoteAnyBrand(estId, checked);
                                  } catch (error) {
                                    const message =
                                      error instanceof ApiError
                                        ? error.message
                                        : t("modules.quotation.quotations.create.toastSaveError");
                                    toast.error(message);
                                    return;
                                  }
                                }
                                setDraftLine((cur) =>
                                  cur
                                    ? {
                                        ...cur,
                                        anyBrand: checked,
                                        brands: checked ? [] : cur.brands,
                                        brandIds: checked ? [] : cur.brandIds,
                                      }
                                    : cur,
                                );
                              })();
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-auto min-h-9 w-full justify-between"
                                disabled={draftLine.anyBrand}
                              >
                                <div className="flex flex-wrap items-center gap-1 text-left">
                                  {draftLine.anyBrand ? (
                                    <Badge variant="secondary">
                                      {t("modules.quotation.quotations.create.anyBrand")}
                                    </Badge>
                                  ) : draftLine.brands.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">
                                      {t("modules.quotation.quotations.create.selectBrand")}
                                    </span>
                                  ) : (
                                    <BrandSelectBadges brands={draftLine.brands} />
                                  )}
                                </div>
                                <ChevronDown className="size-4 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder={t("modules.quotation.quotations.create.selectBrand")} />
                                <CommandList>
                                  <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value={t("modules.quotation.quotations.create.selectAllBrands")}
                                      onSelect={() =>
                                        setAllDraftBrands(selectedProductId, p.brands, !isAllBrandsSelected)
                                      }
                                      className="flex items-center justify-between gap-2"
                                    >
                                      <span>{t("modules.quotation.quotations.create.selectAllBrands")}</span>
                                      <Checkbox checked={isAllBrandsSelected} />
                                    </CommandItem>
                                    {p.brands.map((brand) => {
                                      const checked = draftLine.brands.includes(brand);
                                      return (
                                        <CommandItem
                                          key={brand}
                                          value={brand}
                                          onSelect={() =>
                                            toggleDraftBrand(selectedProductId, brand, !checked)
                                          }
                                          className="flex items-center justify-between gap-2"
                                        >
                                          <span>{brand}</span>
                                          <Checkbox checked={checked} />
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={clearSelection}>
                    {t("modules.quotation.quotations.create.cancel")}
                  </Button>
                  <Button type="button" className="text-white" onClick={addSelectedToBudget}>
                    Adicionar
                  </Button>
                </div>
              </div>
                ) : null}
                {showProductList ? (
                  <>
                    <CommandList className="max-h-none min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                        {t("modules.quotation.quotations.create.noProductsMatch")}
                      </CommandEmpty>
                      <CommandGroup>
                        {availableProducts.map((p) => {
                          const source = byCompositeId.get(p.id);
                          const isSelected = selectedProductId === p.id;
                          return (
                            <CommandItem
                              key={p.id}
                              value={`${p.name} ${p.brands.join(" ")}`}
                              className={cn(
                                "rounded-md px-0 py-2.5",
                                isSelected && "bg-accent",
                              )}
                              onSelect={() => selectProduct(p)}
                            >
                              <div className="flex min-w-0 flex-1 items-start gap-2">
                                <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium leading-snug text-foreground">
                                    {formatProductListTitle(p.name)}
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {formatProductListSubtitle(p, {
                                      quoteAnyBrand: source?.quoteAnyBrand,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                    {canAddFromPlatform ? (
                      <div className="shrink-0 border-t pt-3">
                        <Button
                          type="button"
                          className="w-full text-white"
                          onClick={() => setPlatformProductDialogOpen(true)}
                        >
                          {t("modules.quotation.quotations.create.addProductFromPlatform")}
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </Command>
            </div>
            <p className="shrink-0 border-t bg-muted/20 px-6 py-2 text-xs text-muted-foreground">
              {t("modules.quotation.quotations.create.availableCount", { count: availableCount })}
            </p>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-1 flex-col lg:col-span-6">
          <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-2 space-y-0 p-6 pb-3">
            <CardTitle className="text-base">
              {t("modules.quotation.quotations.create.budgetTitle", { count: linesArray.length })}
            </CardTitle>
            {linesArray.length > 0 && !isReadOnly ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={clearZeroQuantityLines}
                >
                  {t("modules.quotation.quotations.create.clearZeroQty")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 shrink-0 gap-1 text-destructive hover:text-destructive"
                  onClick={clearAll}
                  disabled={isOpenLimited}
                >
                  <Trash2 className="size-4" />
                  {t("modules.quotation.quotations.create.clearAll")}
                </Button>
              </div>
            ) : (
              <span className="h-9 min-w-[7.25rem] shrink-0 sm:min-w-[8.5rem]" aria-hidden />
            )}
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-0">
            {linesArray.length > 0 ? (
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <Input
                  value={lineNameFilter}
                  onChange={(e) => setLineNameFilter(e.target.value)}
                  placeholder={t("modules.quotation.quotations.create.filterByName")}
                />
                <Select
                  value={lineSegmentFilter || "all"}
                  onValueChange={(value) => setLineSegmentFilter(value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("modules.quotation.quotations.create.filterBySegment")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("modules.quotation.quotations.create.filterBySegment")}</SelectItem>
                    {lineSegmentOptions.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {linesArray.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <Package className="size-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">{t("modules.quotation.quotations.create.emptyBudget")}</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {t("modules.quotation.quotations.create.emptyBudgetHint")}
                </p>
              </div>
            ) : (
              <ScrollArea className="min-h-0 flex-1 pr-3">
                <div className="space-y-4 pb-2">
                  {filteredLinesArray.map((line) => {
                    const p = productById.get(line.productId);
                    if (!p) return null;
                    const index = linesArray.findIndex((item) => item.productId === line.productId);
                    const isExpanded = expandedProductId == null ? index === linesArray.length - 1 : expandedProductId === line.productId;
                    const isAllBrandsSelected = p.brands.length > 0 && line.brands.length === p.brands.length;
                    const unit = p.unit;
                    /** Minimizado e incompleto: sempre destaca. Expandido e incompleto: só após tentar continuar. */
                    const lineInvalid =
                      !isLineComplete(line, unit) && (!isExpanded || showLineValidation);
                    return (
                      <Collapsible key={line.productId} open={isExpanded}>
                        <div
                          id={`budget-line-${line.productId}`}
                          className={cn(
                            "relative rounded-lg bg-card p-4 text-left shadow-sm",
                            lineInvalid
                              ? "border-2 border-warning"
                              : "border border-border",
                            isExpanded && !lineInvalid ? "ring-1 ring-primary/30" : "",
                          )}
                        >
                          {!isExpanded ? (
                            <button
                              type="button"
                              className="absolute inset-0 z-[1] cursor-pointer rounded-lg border-0 bg-transparent p-0"
                              aria-label={t("modules.quotation.quotations.create.expandLine")}
                              onClick={() => setExpandedProductId(line.productId)}
                            />
                          ) : null}

                          <div
                            className={cn("relative z-[2]", !isExpanded && "pointer-events-none")}
                          >
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <div
                                className={cn(
                                  "flex min-w-0 flex-1 items-start gap-2 rounded-md outline-none",
                                  isExpanded && "cursor-pointer pointer-events-auto",
                                )}
                                onClick={
                                  isExpanded
                                    ? () => {
                                        setExpandedProductId(null);
                                      }
                                    : undefined
                                }
                                onKeyDown={
                                  isExpanded
                                    ? (e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          setExpandedProductId(null);
                                        }
                                      }
                                    : undefined
                                }
                                role={isExpanded ? "button" : undefined}
                                tabIndex={isExpanded ? 0 : undefined}
                                aria-label={
                                  isExpanded ? t("modules.quotation.quotations.create.collapseLine") : undefined
                                }
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-foreground">
                                    {index + 1}. {p.name}
                                  </p>
                                  {isExpanded && p.packagingUnit ? (
                                    <span className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                      {formatPackagingUnit(p.packagingUnit)}
                                    </span>
                                  ) : (
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                      {formatBudgetLineCollapsedSummary(line, p, {
                                        anyBrand: t("modules.quotation.quotations.create.anyBrand"),
                                        none: "—",
                                      })}
                                    </p>
                                  )}
                                </div>
                                <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>
                                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                </span>
                              </div>
                              <div className="pointer-events-auto flex shrink-0 gap-1">
                                {!isReadOnly ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() =>
                                      setSuppliersDialog({
                                        productId: lineBaseProductId(line),
                                        productName: p.name,
                                      })
                                    }
                                  >
                                    {t("modules.quotation.quotations.create.manageSuppliers")}
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => removeProduct(line.productId)}
                                  disabled={isReadOnly || isOpenLimited}
                                  aria-label={t("modules.quotation.quotations.create.remove")}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>

                          <CollapsibleContent className="pt-2">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)]">
                              <Label className="text-xs">{t("modules.quotation.quotations.create.qty")}</Label>
                              <Label htmlFor={`any-${line.productId}`} className="text-xs">
                                {t("modules.quotation.quotations.create.anyBrand")}
                              </Label>
                              <Label className="text-xs">{t("modules.quotation.quotations.create.selectBrand")}</Label>

                              <div className="flex items-center gap-2 py-0.5">
                                <Input
                                  type="number"
                                  min={0}
                                  step={unit.toLowerCase() === "un" ? 1 : 0.0001}
                                  className="w-20 focus-visible:ring-offset-0"
                                  value={line.quantity}
                                  disabled={isReadOnly || isOpenLimited}
                                  onFocus={(e) => e.currentTarget.select()}
                                  onChange={(e) => {
                                    const n = Number(e.target.value);
                                    const normalized = normalizeQuantity(n, unit);
                                    updateLine(line.productId, {
                                      quantity: normalized ?? 0,
                                    });
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">{p.unit}</span>
                              </div>

                              <div className="flex items-center justify-center">
                                <Switch
                                  id={`any-${line.productId}`}
                                  checked={line.anyBrand}
                                  disabled={isReadOnly || isOpenLimited}
                                  onCheckedChange={(checked) =>
                                    void applyQuoteAnyBrand(line, line.productId, checked)
                                  }
                                />
                              </div>

                              <div className="min-w-0">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="h-auto min-h-9 w-full justify-between"
                                      disabled={line.anyBrand || isReadOnly || isOpenLimited}
                                    >
                                      <div className="flex flex-wrap items-center gap-1 text-left">
                                        {line.anyBrand ? (
                                          <Badge variant="secondary">
                                            {t("modules.quotation.quotations.create.anyBrand")}
                                          </Badge>
                                        ) : line.brands.length === 0 ? (
                                          <span className="text-sm text-muted-foreground">
                                            {t("modules.quotation.quotations.create.selectBrand")}
                                          </span>
                                        ) : (
                                          <BrandSelectBadges brands={line.brands} />
                                        )}
                                      </div>
                                      <ChevronDown className="size-4 text-muted-foreground" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[280px] p-0" align="start">
                                    <Command>
                                      <CommandInput placeholder={t("modules.quotation.quotations.create.selectBrand")} />
                                      <CommandList>
                                        <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                                        <CommandGroup>
                                          <CommandItem
                                            value={t("modules.quotation.quotations.create.selectAllBrands")}
                                            onSelect={() =>
                                              setAllBrands(line.productId, p.brands, !isAllBrandsSelected)
                                            }
                                            className="flex items-center justify-between gap-2"
                                          >
                                            <span>{t("modules.quotation.quotations.create.selectAllBrands")}</span>
                                            <Checkbox checked={isAllBrandsSelected} />
                                          </CommandItem>
                                          {p.brands.map((brand) => {
                                            const checked = line.brands.includes(brand);
                                            return (
                                              <CommandItem
                                                key={brand}
                                                value={brand}
                                                onSelect={() => toggleBrand(line.productId, brand, !checked)}
                                                className="flex items-center justify-between gap-2"
                                              >
                                                <span>{brand}</span>
                                                <Checkbox checked={checked} />
                                              </CommandItem>
                                            );
                                          })}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>

                            <div className="mt-3 space-y-1">
                              <Label className="text-xs text-muted-foreground" htmlFor={`note-${line.productId}`}>
                                {t("modules.quotation.quotations.create.lineNote")}
                              </Label>
                              <Input
                                id={`note-${line.productId}`}
                                value={line.note}
                                disabled={isReadOnly || isOpenLimited}
                                onChange={(e) => updateLine(line.productId, { note: e.target.value })}
                                placeholder={t("modules.quotation.quotations.create.lineNotePlaceholder")}
                              />
                            </div>
                          </CollapsibleContent>
                          </div>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="mt-auto flex flex-col gap-3 border-t bg-muted/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                {t("modules.quotation.quotations.create.footerItems", { count: linesArray.length })}
              </span>
            </div>
            {!isReadOnly ? (
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave()}
                  disabled={isSaving || isSending || catalogLoading}
                >
                  {isSaving
                    ? t("modules.quotation.quotations.create.saving")
                    : t("modules.quotation.quotations.create.save")}
                </Button>
                {canSend ? (
                  <Button
                    type="button"
                    className="gap-1 text-white"
                    onClick={() => handleSend()}
                    disabled={isSaving || isSending || catalogLoading}
                  >
                    {isSending
                      ? t("modules.quotation.quotations.create.sending")
                      : t("modules.quotation.quotations.create.send")}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.quotation.quotations.create.confirmSendTitle")}</DialogTitle>
            <DialogDescription>
              {t("modules.quotation.quotations.create.confirmSendDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmSendOpen(false)}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            <Button type="button" className="text-white" onClick={confirmSend}>
              {t("modules.quotation.quotations.create.confirmSendAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmZeroQtyOpen} onOpenChange={setConfirmZeroQtyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.quotation.quotations.create.confirmZeroQtyTitle")}</DialogTitle>
            <DialogDescription>
              {t("modules.quotation.quotations.create.confirmZeroQtyDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmZeroQtyOpen(false)}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            <Button
              type="button"
              className="text-white"
              onClick={() => {
                setConfirmZeroQtyOpen(false);
                const lines = validateLinesForSubmit();
                if (lines && pendingSubmit) void executeSubmit(pendingSubmit, lines);
              }}
            >
              {t("modules.quotation.quotations.create.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmSameBaseOpen} onOpenChange={setConfirmSameBaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.quotation.quotations.create.confirmSameBaseTitle")}</DialogTitle>
            <DialogDescription>
              {t("modules.quotation.quotations.create.confirmSameBaseDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmSameBaseOpen(false)}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            <Button
              type="button"
              className="text-white"
              onClick={() => {
                setConfirmSameBaseOpen(false);
                if (pendingAddProduct) commitAddProduct(pendingAddProduct.product, pendingAddProduct.line);
                setPendingAddProduct(null);
              }}
            >
              {t("modules.quotation.quotations.create.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {establishmentId ? (
        <AddPlatformProductDialog
          open={platformProductDialogOpen}
          onOpenChange={setPlatformProductDialogOpen}
          initialSearch={productQuery}
          establishmentId={establishmentId}
          onAdded={(product) => void handlePlatformProductAdded(product)}
        />
      ) : null}

      {suppliersDialog && establishmentId ? (
        <BudgetProductSuppliersDialog
          open
          onOpenChange={(open) => {
            if (!open) setSuppliersDialog(null);
          }}
          productId={suppliersDialog.productId}
          productName={suppliersDialog.productName}
          establishmentId={establishmentId}
        />
      ) : null}
    </DashboardPageLayout>
  );
}
