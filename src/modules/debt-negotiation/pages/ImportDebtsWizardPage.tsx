import { useCallback, useMemo, useState } from "react";
import { Download, Upload, Info, AlertTriangle } from "lucide-react";

import {
  useDebtImport,
  useDebtImportFields,
  useDebtImportParse,
  useDebtImportRevalidate,
  useDebtImportValidate,
} from "@/modules/debt-negotiation/hooks";
import type {
  DebtImportFieldDefinition,
  DebtImportValidationRow,
} from "@/modules/debt-negotiation/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";

type WizardStep = 0 | 1 | 2 | 3;

interface ExtendedMapping {
  hasHeaders: boolean;
  columnMapping: Record<string, string | number | null>;
}

interface ParseState {
  fileColumns: string[];
  hasHeaders: boolean;
  suggestedMapping: Record<string, string>;
  preview: Array<Record<string, unknown>>;
}

export function ImportDebtsWizardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>(0);
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<ExtendedMapping>({
    hasHeaders: true,
    columnMapping: {},
  });
  const [parseState, setParseState] = useState<ParseState | null>(null);
  const [validatedRows, setValidatedRows] = useState<DebtImportValidationRow[]>([]);
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [resultStats, setResultStats] = useState<{
    total: number;
    imported: number;
    ignored: number;
  } | null>(null);

  const { data: fieldDefinitions, isLoading: fieldsLoading, error: fieldsError } = useDebtImportFields({
    enabled: step >= 1,
  });
  const parseMutation = useDebtImportParse();
  const validateMutation = useDebtImportValidate();
  const revalidateMutation = useDebtImportRevalidate();
  const importMutation = useDebtImport();

  const templateUrl = "/sample-files/dividas-exemplo.csv";

  const requiredFields = useMemo(
    () => (fieldDefinitions ?? []).filter((f) => f.required),
    [fieldDefinitions],
  );

  const canGoNextFromUpload = Boolean(file);
  const isMappingValid = requiredFields.every(
    (f) => mapping.columnMapping[f.key] !== null && mapping.columnMapping[f.key] !== undefined,
  );

  const hasInvalidRows = validatedRows.some((row) => row.errors && Object.keys(row.errors).length > 0);

  const visibleRows = useMemo(() => {
    if (!showOnlyInvalid) return validatedRows;
    return validatedRows.filter((row) => row.errors && Object.keys(row.errors).length > 0);
  }, [validatedRows, showOnlyInvalid]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setParseState(null);
    setMapping({ hasHeaders: true, columnMapping: {} });
    setValidatedRows([]);
    setResultStats(null);
  }, []);

  const handleParse = useCallback(async () => {
    if (!file) return;
    const response = await parseMutation.mutateAsync(file);
    setParseState({
      fileColumns: response.fileColumns,
      hasHeaders: response.hasHeaders,
      suggestedMapping: response.suggestedMapping,
      preview: response.preview,
    });
    setMapping((prev) => ({
      ...prev,
      hasHeaders: response.hasHeaders,
      columnMapping: response.suggestedMapping,
    }));
    setStep(1);
  }, [file, parseMutation]);

  const handleValidate = useCallback(async () => {
    if (!file || !parseState) return;
    const cleanMapping: Record<string, string> = {};
    Object.entries(mapping.columnMapping).forEach(([key, value]) => {
      if (typeof value === "string") cleanMapping[key] = value;
    });
    const response = await validateMutation.mutateAsync({ file, mapping: cleanMapping });
    setValidatedRows(response.data);
    setStep(2);
  }, [file, mapping.columnMapping, parseState, validateMutation]);

  const handleRevalidateAndImport = useCallback(async () => {
    if (!validatedRows.length) return;
    const response = await revalidateMutation.mutateAsync(
      validatedRows.map((r) => r.row),
    );
    const stillHasErrors = response.data.some((row) => row.errors && Object.keys(row.errors).length > 0);

    if (stillHasErrors) {
      // Importar apenas linhas válidas
      const validRows = response.data.filter((row) => !row.errors || Object.keys(row.errors).length === 0);
      if (validRows.length === 0) return;
      const importResult = await importMutation.mutateAsync(validRows.map((r) => r.row));
      setResultStats(importResult.stats);
      setStep(3);
    } else {
      const importResult = await importMutation.mutateAsync(
        response.data.map((r) => r.row),
      );
      setResultStats(importResult.stats);
      setStep(3);
    }
  }, [importMutation, revalidateMutation, validatedRows]);

  const handleCancel = () => {
    navigate("/debt-negotiation/debts");
  };

  const handleBack = () => {
    setStep((prev) => (prev > 0 ? ((prev - 1) as WizardStep) : prev));
  };

  const handleNext = async () => {
    if (step === 0) {
      await handleParse();
    } else if (step === 1) {
      await handleValidate();
    } else if (step === 2) {
      await handleRevalidateAndImport();
    }
  };

  const currentStepLabel = ["Upload", "Mapeamento", "Validação", "Resultado"][step];

  const renderStepUpload = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.debtNegotiation.importDebts.uploadTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("pages.debtNegotiation.importDebts.uploadDescription")}
        </p>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center">
          <Upload className="mb-3 h-8 w-8 text-primary" />
          <p className="text-sm font-medium text-foreground">
            {t("pages.debtNegotiation.importDebts.uploadDropHint")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("pages.debtNegotiation.importDebts.uploadLimitHint")}
          </p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
            <Button size="sm" asChild>
              <label className="cursor-pointer">
                {t("pages.debtNegotiation.importDebts.selectFile")}
                <Input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
              <a href={templateUrl} download>
                <Download className="h-3.5 w-3.5" />
                {t("pages.debtNegotiation.importDebts.downloadTemplate")}
              </a>
            </Button>
          </div>
          {file && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("pages.debtNegotiation.importDebts.selectedFile", { name: file.name })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderMappingRow = (field: DebtImportFieldDefinition) => {
    const options = parseState?.fileColumns ?? [];
    const value = mapping.columnMapping[field.key] ?? "";
    return (
      <TableRow key={field.key}>
        <TableCell className="align-top">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-medium text-foreground">{field.label}</span>
            {field.required && <span className="text-destructive">*</span>}
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>
        </TableCell>
        <TableCell className="align-top">
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={typeof value === "string" ? value : ""}
            onChange={(event) =>
              setMapping((prev) => ({
                ...prev,
                columnMapping: {
                  ...prev.columnMapping,
                  [field.key]: event.target.value || null,
                },
              }))
            }
          >
            <option value="">{t("pages.debtNegotiation.importDebts.notMapped")}</option>
            {options.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("pages.debtNegotiation.importDebts.example", { example: field.example })}
          </p>
        </TableCell>
      </TableRow>
    );
  };

  const renderStepMapping = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.debtNegotiation.importDebts.mappingTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldsLoading && (
          <p className="text-sm text-muted-foreground">
            {t("pages.debtNegotiation.importDebts.loadingFields")}
          </p>
        )}
        {fieldsError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t("pages.debtNegotiation.importDebts.errorFields")}
          </p>
        )}
        {!fieldsLoading && !fieldsError && fieldDefinitions && (
          <>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {t("pages.debtNegotiation.importDebts.autoMappingHint", {
                mapped: Object.keys(mapping.columnMapping).length,
                total: fieldDefinitions.length,
              })}
            </div>
            <div className="card-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("pages.debtNegotiation.importDebts.systemField")}</TableHead>
                    <TableHead>{t("pages.debtNegotiation.importDebts.fileColumn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{fieldDefinitions.map(renderMappingRow)}</TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderStepValidation = () => (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{t("pages.debtNegotiation.importDebts.validationTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex items-center justify-between rounded-md border px-3 py-2 text-xs",
            hasInvalidRows
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-emerald-300 bg-emerald-50 text-emerald-800",
          )}
        >
          <span>
            {hasInvalidRows
              ? t("pages.debtNegotiation.importDebts.validationHasErrors")
              : t("pages.debtNegotiation.importDebts.validationAllGood")}
          </span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={showOnlyInvalid}
                onChange={(event) => setShowOnlyInvalid(event.target.checked)}
              />
              {t("pages.debtNegotiation.importDebts.showOnlyInvalid")}
            </label>
          </div>
        </div>

        <div className="card-surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {validatedRows[0] &&
                  Object.keys(validatedRows[0].row).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.slice(0, 50).map((item, index) => (
                <TableRow key={`${index}-${Object.keys(item.row).join("-")}`}>
                  {Object.entries(item.row).map(([key, value]) => {
                    const hasError = item.errors && item.errors[key];
                    return (
                      <TableCell
                        key={key}
                        className={cn(
                          "text-xs",
                          hasError && "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200",
                        )}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {visibleRows.length === 0 && (
                <TableRow>
                  <TableCell className="py-6 text-center text-xs text-muted-foreground">
                    {t("pages.debtNegotiation.importDebts.noRowsToShow")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderStepResult = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.debtNegotiation.importDebts.resultTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-center text-emerald-800">
          <CheckCircleIcon />
          <p className="mt-2 text-sm font-medium">
            {t("pages.debtNegotiation.importDebts.resultSuccess")}
          </p>
          {resultStats && (
            <div className="mt-4 flex gap-6 text-xs">
              <div>
                <p className="font-semibold">
                  {t("pages.debtNegotiation.importDebts.resultImported")}
                </p>
                <p>{resultStats.imported}</p>
              </div>
              <div>
                <p className="font-semibold">
                  {t("pages.debtNegotiation.importDebts.resultIgnored")}
                </p>
                <p>{resultStats.ignored}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  let mainContent: JSX.Element;
  if (step === 0) mainContent = renderStepUpload();
  else if (step === 1) mainContent = renderStepMapping();
  else if (step === 2) mainContent = renderStepValidation();
  else mainContent = renderStepResult();

  const isNextDisabled =
    (step === 0 && !canGoNextFromUpload) ||
    (step === 1 && (!parseState || !isMappingValid)) ||
    (step === 2 && !validatedRows.length) ||
    parseMutation.isPending ||
    validateMutation.isPending ||
    revalidateMutation.isPending ||
    importMutation.isPending;

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("pages.debtNegotiation.importDebts.breadcrumb")}
          </p>
          <h1 className="text-xl font-semibold text-foreground">
            {t("pages.debtNegotiation.importDebts.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("pages.debtNegotiation.importDebts.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-7 items-center rounded-full border border-border px-3">
            {t("pages.debtNegotiation.importDebts.stepLabel", {
              step: step + 1,
              total: 4,
              label: currentStepLabel,
            })}
          </span>
        </div>
      </div>

      {mainContent}

      <div className="flex items-center justify-between">
        <Button variant="ghost" type="button" onClick={handleCancel}>
          {t("common.actions.cancel")}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={step === 0}
            onClick={handleBack}
          >
            {t("common.actions.previous")}
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
            >
              {step === 2
                ? t("pages.debtNegotiation.importDebts.importAction")
                : t("common.actions.next")}
            </Button>
          ) : (
            <Button type="button" onClick={() => navigate("/debt-negotiation/debts")}>
              {t("pages.debtNegotiation.importDebts.backToDashboard")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8 text-emerald-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

