import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Package,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MOCK_CATALOG_PRODUCTS } from "@/modules/quotation/data/quotationMocks";
import type { BudgetLineItem, CatalogProduct } from "@/modules/quotation/types";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
    brand: product.brands[0] ?? null,
    note: "",
  };
}

export function CreateQuotationPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(() => new Date());
  const [deadlineTime, setDeadlineTime] = useState(defaultTimeString);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [observations, setObservations] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [lineItems, setLineItems] = useState<Record<string, BudgetLineItem>>({});

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
    return Object.values(lineItems).sort((a, b) => {
      const pa = productById.get(a.productId);
      const pb = productById.get(b.productId);
      if (!pa || !pb) return 0;
      return pa.categoryLabel.localeCompare(pb.categoryLabel) || pa.name.localeCompare(pb.name);
    });
  }, [lineItems]);

  const categoryCount = useMemo(() => {
    const cats = new Set(linesArray.map((l) => productById.get(l.productId)?.category).filter(Boolean));
    return cats.size;
  }, [linesArray]);

  const availableCount = MOCK_CATALOG_PRODUCTS.length - addedIds.size;

  function addProduct(p: CatalogProduct) {
    setLineItems((prev) => ({
      ...prev,
      [p.id]: prev[p.id] ?? emptyLineItem(p),
    }));
  }

  function removeProduct(productId: string) {
    setLineItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function clearAll() {
    setLineItems({});
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
    for (const line of linesArray) {
      if (!line.anyBrand && !line.brand) {
        toast.error(t("modules.quotation.quotations.create.validationBrand"));
        return;
      }
    }
    toast.success(t("modules.quotation.quotations.create.toastSuccess"));
    navigate("/quotations");
  }

  if (step === 1) {
    return (
      <DashboardPageLayout showPageHeader={false}>
        <Card className="mx-auto max-w-3xl">
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
                  <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="deadline-time"
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-time">{t("modules.quotation.quotations.create.deliveryTime")}</Label>
              <div className="relative max-w-md">
                <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="delivery-time"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="pl-9"
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
          <CardFooter className="flex justify-end gap-2 border-t bg-muted/30">
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="flex min-h-[420px] flex-col">
          <CardHeader className="pb-3">
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
          <CardContent className="flex-1 overflow-hidden pt-0">
            <ScrollArea className="h-[min(52vh,480px)] pr-3">
              <div className="space-y-6 pb-2">
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
                      <div className="space-y-1">
                        {products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addProduct(p)}
                            className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left text-sm transition-colors hover:border-border hover:bg-muted/50"
                          >
                            <Package className="size-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 font-medium text-foreground">{p.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {p.unit} · {formatMoney(p.unitPriceCents)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("modules.quotation.quotations.create.availableHint")}
            </p>
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-3">
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
          <CardContent className="flex-1 overflow-hidden pt-0">
            {linesArray.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <Package className="size-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">{t("modules.quotation.quotations.create.emptyBudget")}</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {t("modules.quotation.quotations.create.emptyBudgetHint")}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[min(52vh,480px)] pr-3">
                <div className="space-y-4 pb-2">
                  {linesArray.map((line, index) => {
                    const p = productById.get(line.productId);
                    if (!p) return null;
                    return (
                      <div
                        key={line.productId}
                        className="rounded-lg border border-border bg-card p-4 shadow-sm"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {index + 1}. {p.name}
                            </p>
                            <span className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                              {p.category}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeProduct(line.productId)}
                            aria-label={t("modules.quotation.quotations.create.remove")}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

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
                                onChange={(e) => {
                                  const n = Number.parseInt(e.target.value, 10);
                                  updateLine(line.productId, {
                                    quantity: Number.isFinite(n) && n >= 1 ? n : 1,
                                  });
                                }}
                              />
                              <span className="text-sm text-muted-foreground">{p.unit}</span>
                            </div>
                          </div>

                          <div className="flex min-w-[200px] flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`any-${line.productId}`}
                                checked={line.anyBrand}
                                onCheckedChange={(checked) =>
                                  updateLine(line.productId, {
                                    anyBrand: checked,
                                    brand: checked ? null : p.brands[0] ?? null,
                                  })
                                }
                              />
                              <Label htmlFor={`any-${line.productId}`} className="text-xs font-normal">
                                {t("modules.quotation.quotations.create.anyBrand")}
                              </Label>
                            </div>
                            <Select
                              value={line.anyBrand ? undefined : line.brand ?? undefined}
                              onValueChange={(v) => updateLine(line.productId, { brand: v || null })}
                              disabled={line.anyBrand}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder={t("modules.quotation.quotations.create.selectBrand")} />
                              </SelectTrigger>
                              <SelectContent>
                                {p.brands.map((b) => (
                                  <SelectItem key={b} value={b}>
                                    {b}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="mt-auto flex flex-col gap-3 border-t bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
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
