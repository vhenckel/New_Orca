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
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MOCK_CATALOG_PRODUCTS } from "@/modules/quotation/data/quotationMocks";
import type { BudgetLineItem, CatalogProduct } from "@/modules/quotation/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Calendar } from "@/shared/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/shared/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/sonner";
import { useI18n } from "@/shared/i18n/useI18n";

const productById = new Map(MOCK_CATALOG_PRODUCTS.map((p) => [p.id, p]));

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function defaultTimeString() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function emptyLineItem(product: CatalogProduct): BudgetLineItem {
  return {
    productId: product.id,
    quantity: 1,
    anyBrand: false,
    brands: [],
    note: "",
  };
}

function isLineComplete(line: BudgetLineItem): boolean {
  const qtyOk = Number.isFinite(line.quantity) && line.quantity >= 1;
  const brandsOk = line.anyBrand || line.brands.length > 0;
  return qtyOk && brandsOk;
}

export function CreateQuotationPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(() => new Date());
  const [deadlineTime, setDeadlineTime] = useState(defaultTimeString);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [observations, setObservations] = useState("");
  const deadlineTimeRef = useRef<HTMLInputElement>(null);
  const deliveryTimeRef = useRef<HTMLInputElement>(null);

  const [productSearch, setProductSearch] = useState("");
  const [lineItems, setLineItems] = useState<Record<string, BudgetLineItem>>({});
  /** Ordem de inclusão: novos itens sempre no final. */
  const [lineOrder, setLineOrder] = useState<string[]>([]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [showLineValidation, setShowLineValidation] = useState(false);

  const addedIds = useMemo(() => new Set(Object.keys(lineItems)), [lineItems]);

  const groupedAvailable = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const filtered = MOCK_CATALOG_PRODUCTS.filter((p) => !addedIds.has(p.id)).filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
    const byCat = new Map<string, CatalogProduct[]>();
    for (const p of filtered) {
      const list = byCat.get(p.categoryLabel) ?? [];
      list.push(p);
      byCat.set(p.categoryLabel, list);
    }
    return Array.from(byCat.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [productSearch, addedIds]);

  const linesArray = useMemo(() => {
    return lineOrder.map((id) => lineItems[id]).filter(Boolean);
  }, [lineOrder, lineItems]);

  const categoryCount = useMemo(() => {
    const cats = new Set(linesArray.map((l) => productById.get(l.productId)?.category).filter(Boolean));
    return cats.size;
  }, [linesArray]);

  const availableCount = MOCK_CATALOG_PRODUCTS.length - addedIds.size;

  function addProduct(p: CatalogProduct) {
    const isNew = !lineItems[p.id];
    setLineItems((prev) => ({
      ...prev,
      [p.id]: prev[p.id] ?? emptyLineItem(p),
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

  function handleNextFromStep1() {
    if (!deadlineDate) {
      toast.error(t("modules.quotation.quotations.create.validationDeadline"));
      return;
    }
    setStep(2);
  }

  function handleFinish() {
    if (linesArray.length === 0) {
      toast.error(t("modules.quotation.quotations.create.validationProducts"));
      return;
    }
    const incomplete = linesArray.filter((line) => !isLineComplete(line));
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
      return;
    }
    setShowLineValidation(false);
    toast.success(t("modules.quotation.quotations.create.toastSuccess"));
    navigate("/quotations");
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
    updateLine(productId, { brands: selected ? brands : [] });
  }

  function toggleBrand(productId: string, brand: string, selected: boolean) {
    setLineItems((prev) => {
      const cur = prev[productId];
      if (!cur) return prev;
      const exists = cur.brands.includes(brand);
      if (selected && exists) return prev;
      if (!selected && !exists) return prev;
      const nextBrands = selected ? [...cur.brands, brand] : cur.brands.filter((b) => b !== brand);
      return { ...prev, [productId]: { ...cur, brands: nextBrands } };
    });
  }

  useEffect(() => {
    if (!lastAddedProductId) return;
    const el = document.getElementById(`budget-line-${lastAddedProductId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lastAddedProductId, linesArray.length]);

  useEffect(() => {
    if (!showLineValidation) return;
    if (linesArray.length > 0 && linesArray.every(isLineComplete)) {
      setShowLineValidation(false);
    }
  }, [showLineValidation, linesArray]);

  if (step === 1) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("modules.quotation.quotations.create.step1Title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-1">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-time">{t("modules.quotation.quotations.create.deliveryTime")}</Label>
              <div className="relative max-w-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 z-10 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => openTimePicker(deliveryTimeRef.current)}
                  aria-label={t("modules.quotation.quotations.create.deliveryTime")}
                >
                  <Clock className="size-4" />
                </Button>
                <Input
                  ref={deliveryTimeRef}
                  id="delivery-time"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden"
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t bg-muted/30 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/quotations")}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            <Button type="button" onClick={handleNextFromStep1}>
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
                onClick={() => setStep(1)}
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
            <Button type="button" variant="outline" onClick={() => navigate("/quotations")}>
              {t("modules.quotation.quotations.create.cancel")}
            </Button>
            <Button type="button" className="gap-1" onClick={handleFinish}>
              {t("modules.quotation.quotations.create.continue")}
              <span aria-hidden>›</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-stretch">
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader className="shrink-0 pb-3">
            <CardTitle className="text-base">{t("modules.quotation.quotations.create.availableTitle")}</CardTitle>
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={t("modules.quotation.quotations.create.searchProducts")}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("modules.quotation.quotations.create.availableCount", { count: availableCount })}
            </p>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden pt-0">
            <ScrollArea className="min-h-0 flex-1 pr-3">
              <div className="flex flex-col gap-6 pb-2">
                {groupedAvailable.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("modules.quotation.quotations.create.noProductsMatch")}
                  </p>
                ) : (
                  groupedAvailable.map(([category, products]) => (
                    <div key={category}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {category}
                      </p>
                      <div className="flex flex-col gap-1">
                        {products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addProduct(p)}
                            className="flex w-full items-start gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-muted/50"
                          >
                            <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <span className="block text-sm font-medium leading-snug text-foreground">{p.name}</span>
                              <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground sm:text-xs">
                                {p.unit} · {formatMoney(p.unitPriceCents)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <p className="shrink-0 text-xs text-muted-foreground">
              {t("modules.quotation.quotations.create.availableHint")}
            </p>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader className="flex shrink-0 flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-base">
              {t("modules.quotation.quotations.create.budgetTitle", { count: linesArray.length })}
            </CardTitle>
            {linesArray.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="size-4" />
                {t("modules.quotation.quotations.create.clearAll")}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pt-0">
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
                  {linesArray.map((line, index) => {
                    const p = productById.get(line.productId);
                    if (!p) return null;
                    const isExpanded = expandedProductId == null ? index === linesArray.length - 1 : expandedProductId === line.productId;
                    const isAllBrandsSelected = p.brands.length > 0 && line.brands.length === p.brands.length;
                    /** Minimizado e incompleto: sempre destaca. Expandido e incompleto: só após tentar continuar. */
                    const lineInvalid =
                      !isLineComplete(line) && (!isExpanded || showLineValidation);
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
                                  {isExpanded ? (
                                    <span className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                                      {p.category}
                                    </span>
                                  ) : null}
                                </div>
                                <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>
                                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="pointer-events-auto shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeProduct(line.productId)}
                                aria-label={t("modules.quotation.quotations.create.remove")}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>

                          <CollapsibleContent className="pt-2">
                            <div className="flex flex-wrap items-end gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">{t("modules.quotation.quotations.create.qty")}</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={1}
                                    step={1}
                                    className="w-20"
                                    value={line.quantity}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) => {
                                      const n = Number(e.target.value);
                                      if (!Number.isFinite(n)) return;
                                      updateLine(line.productId, {
                                        quantity: n >= 1 ? Math.trunc(n) : 1,
                                      });
                                    }}
                                  />
                                  <span className="text-sm text-muted-foreground">{p.unit}</span>
                                </div>
                              </div>

                              <div className="flex min-w-[260px] flex-1 flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`any-${line.productId}`}
                                    checked={line.anyBrand}
                                    onCheckedChange={(checked) =>
                                      updateLine(line.productId, {
                                        anyBrand: checked,
                                      })
                                    }
                                  />
                                  <Label htmlFor={`any-${line.productId}`} className="text-xs font-normal">
                                    {t("modules.quotation.quotations.create.anyBrand")}
                                  </Label>
                                </div>
                                <Label className="text-xs">{t("modules.quotation.quotations.create.selectBrand")}</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="h-auto min-h-10 w-full justify-between"
                                      disabled={line.anyBrand}
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
                                        ) : isAllBrandsSelected ? (
                                          <Badge variant="secondary">
                                            {t("modules.quotation.quotations.create.selectAllBrands")}
                                          </Badge>
                                        ) : (
                                          line.brands.map((brand) => (
                                            <Badge key={brand} variant="secondary">
                                              {brand}
                                            </Badge>
                                          ))
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
              <span>
                {t("modules.quotation.quotations.create.footerCategories", { count: categoryCount })}
              </span>
            </div>
            <Button type="button" className="gap-1 sm:ml-auto" onClick={handleFinish}>
              {t("modules.quotation.quotations.create.continue")}
              <span aria-hidden>›</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
