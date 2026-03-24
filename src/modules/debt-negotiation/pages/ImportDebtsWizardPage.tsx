import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
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
import { toast } from "@/shared/hooks/use-toast";

type WizardStep = 0 | 1 | 2 | 3;

interface ExtendedMapping {
  hasHeaders: boolean;
  columnMapping: Record<string, string | number | null>;
}

interface ParseState {
  fileColumns: string[];
  hasHeaders: boolean;
  suggestedMapping: Record<string, string>;
  // Backend parse preview is essentially "raw CSV data". Pode ser array de arrays (como no legado).
  preview: unknown[];
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  const nums = digits.split("").map(Number);
  const calc = (factor: number) => {
    const total = nums
      .slice(0, factor - 1)
      .reduce((acc, num, idx) => acc + num * (factor - idx), 0);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(10) === nums[9] && calc(11) === nums[10];
}

function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const nums = digits.split("").map(Number);
  const calc = (base: number[], factors: number[]) => {
    const sum = base.reduce((acc, n, idx) => acc + n * factors[idx], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = calc(nums.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(nums.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === nums[12] && d2 === nums[13];
}

function isRowValidForImport(row: DebtImportValidationRow): boolean {
  const errs = row.errors;
  if (!errs) return true;
  if (errs._) return false;
  return Object.keys(errs).filter((k) => k !== "_").length === 0;
}

export function ImportDebtsWizardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const showApiErrorToast = useCallback((error: unknown, fallbackMessage: string) => {
    const message = error instanceof Error ? error.message : fallbackMessage;
    toast({
      title: "Erro na importação",
      description: message,
      variant: "destructive",
    });
  }, []);

  const [step, setStep] = useState<WizardStep>(0);
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<ExtendedMapping>({
    hasHeaders: true,
    columnMapping: {},
  });
  const [parseState, setParseState] = useState<ParseState | null>(null);
  const [validatedRows, setValidatedRows] = useState<DebtImportValidationRow[]>([]);
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [resultErrors, setResultErrors] = useState<DebtImportValidationRow[]>([]);
  const [showOnlyInvalidToggle, setShowOnlyInvalidToggle] = useState(false);
  const [resultStats, setResultStats] = useState<{
    total: number;
    imported: number;
    ignored: number;
  } | null>(null);

  const [revalidationModalOpen, setRevalidationModalOpen] = useState(false);
  const [revalidationNotAllowed, setRevalidationNotAllowed] = useState(false);
  const [revalidationSummary, setRevalidationSummary] = useState<{
    valid: number;
    invalid: number;
    limitExceeded: number;
  } | null>(null);
  const [confirmImportLoading, setConfirmImportLoading] = useState(false);

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

  const fieldTypeByColumn = useMemo(() => {
    const byColumn: Record<string, DebtImportFieldDefinition["type"]> = {};
    if (!fieldDefinitions) return byColumn;

    // O backend pode retornar a “chave da linha” como key do domínio ou como label.
    for (const f of fieldDefinitions) {
      byColumn[f.key] = f.type;
      byColumn[f.label] = f.type;
    }

    const defByKey = new Map(fieldDefinitions.map((f) => [f.key, f] as const));
    // Caso o backend retorne exatamente o nome da coluna do CSV, cobre também isso.
    for (const [fieldKey, columnName] of Object.entries(mapping.columnMapping)) {
      if (typeof columnName !== "string") continue;
      const def = defByKey.get(fieldKey);
      if (!def) continue;
      byColumn[columnName] = def.type;
    }

    return byColumn;
  }, [fieldDefinitions, mapping.columnMapping]);

  const requiredByColumn = useMemo(() => {
    const byColumn: Record<string, boolean> = {};
    if (!fieldDefinitions) return byColumn;

    for (const f of fieldDefinitions) {
      byColumn[f.key] = f.required;
      byColumn[f.label] = f.required;
    }

    const defByKey = new Map(fieldDefinitions.map((f) => [f.key, f] as const));
    for (const [fieldKey, columnName] of Object.entries(mapping.columnMapping)) {
      if (typeof columnName !== "string") continue;
      const def = defByKey.get(fieldKey);
      if (!def) continue;
      byColumn[columnName] = def.required;
    }

    return byColumn;
  }, [fieldDefinitions, mapping.columnMapping]);

  const isValidPhone = (value: string): boolean => {
    const digits = onlyDigits(value);
    return digits.length === 10 || digits.length === 11;
  };

  const isValidCurrency = (value: string): boolean => {
    const cleaned = String(value)
      .trim()
      .replace(/[R$\u00A0\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    if (!cleaned) return false;
    if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return false;
    return Number.isFinite(Number(cleaned));
  };

  const isValidDate = (value: string): boolean => {
    const m = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return false;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
  };

  const visibleRows = useMemo(() => {
    const rowsWithIndex = validatedRows.map((row, originalIndex) => ({
      row,
      originalIndex,
    }));
    if (!showOnlyInvalid) return rowsWithIndex;
    // Se não houver mais linhas inválidas, a UI deve voltar a exibir tudo mesmo com o switch ligado.
    if (!hasInvalidRows) return rowsWithIndex;
    return rowsWithIndex.filter((entry) => entry.row.errors && Object.keys(entry.row.errors).length > 0);
  }, [validatedRows, showOnlyInvalid, hasInvalidRows]);

  const validateInlineField = useCallback(
    (columnName: string, rawValue: string): string | undefined => {
      const value = String(rawValue ?? "").trim();
      const fieldType = fieldTypeByColumn[columnName];
      const required = requiredByColumn[columnName] ?? false;
      if (!fieldType) return undefined;

      if (value.length === 0) {
        return required ? "Campo obrigatório." : undefined;
      }

      if (fieldType === "cpf") {
        return isValidCpf(value) ? undefined : "CPF inválido. Verifique os dígitos verificadores";
      }
      if (fieldType === "cpf/cnpj") {
        const digits = onlyDigits(value);
        if (digits.length === 11) {
          return isValidCpf(value) ? undefined : "CPF inválido. Verifique os dígitos verificadores";
        }
        if (digits.length === 14) {
          return isValidCnpj(value) ? undefined : "CNPJ inválido. Verifique os dígitos verificadores";
        }
        return "Documento inválido. Informe um CPF ou CNPJ válido";
      }
      if (fieldType === "email") {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "E-mail inválido.";
      }
      if (fieldType === "phone") {
        return isValidPhone(value) ? undefined : "Telefone inválido.";
      }
      if (fieldType === "currency") {
        return isValidCurrency(value) ? undefined : "Valor inválido.";
      }
      if (fieldType === "date") {
        return isValidDate(value) ? undefined : "Data inválida.";
      }
      if (fieldType === "string") {
        return undefined;
      }
      return undefined;
    },
    [fieldTypeByColumn, requiredByColumn],
  );

  const handleInlineCellChange = useCallback((rowIndex: number, key: string, value: string) => {
    setValidatedRows((prev) =>
      prev.map((entry, idx) =>
        idx === rowIndex ? { ...entry, row: { ...entry.row, [key]: value } } : entry,
      ),
    );
  }, []);

  const handleInlineCellBlur = useCallback(
    (rowIndex: number, key: string) => {
      const timerKey = `${rowIndex}-${key}`;

      // Remove o erro atual imediatamente (limpeza otimista) para o usuário perceber efeito no blur.
      setValidatedRows((prev) =>
        prev.map((entry, idx) => {
          if (idx !== rowIndex) return entry;
          const nextErrors = { ...(entry.errors ?? {}) };
          if (nextErrors[key]) delete nextErrors[key];
          const hasErrors = Object.keys(nextErrors).length > 0;
          return {
            ...entry,
            errors: hasErrors ? nextErrors : undefined,
          };
        }),
      );

      if (blurTimersRef.current[timerKey]) {
        window.clearTimeout(blurTimersRef.current[timerKey]);
      }

      blurTimersRef.current[timerKey] = window.setTimeout(() => {
        setValidatedRows((prev) =>
          prev.map((entry, idx) => {
            if (idx !== rowIndex) return entry;
            const nextError = validateInlineField(key, entry.row[key] ?? "");
            const nextErrors = { ...(entry.errors ?? {}) };
            if (nextError) nextErrors[key] = nextError;
            else delete nextErrors[key];
            const hasErrors = Object.keys(nextErrors).length > 0;
            return {
              ...entry,
              errors: hasErrors ? nextErrors : undefined,
            };
          }),
        );
      }, 100);
    },
    [validateInlineField],
  );

  const blurTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      for (const timerId of Object.values(blurTimersRef.current)) {
        window.clearTimeout(timerId);
      }
      blurTimersRef.current = {};
    };
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setParseState(null);
    setMapping({ hasHeaders: true, columnMapping: {} });
    setValidatedRows([]);
    setResultErrors([]);
    setResultStats(null);
    setRevalidationModalOpen(false);
    setRevalidationNotAllowed(false);
    setRevalidationSummary(null);
    setConfirmImportLoading(false);
    setShowOnlyInvalid(false);
    setShowOnlyInvalidToggle(false);
  }, []);

  const handleHasHeadersToggle = useCallback(
    (nextHasHeaders: boolean) => {
      if (!parseState) return;

      // Paridade com o legado: quando alterna cabeçalho, recalcula os "headers"
      // e zera o mapeamento para forçar revisão do usuário.
      const preview = parseState.preview;
      let nextFileColumns = parseState.fileColumns;

      if (preview.length > 0 && Array.isArray(preview[0])) {
        const rows = preview as unknown[][];

        if (nextHasHeaders) {
          const firstRow = rows[0];
          nextFileColumns = firstRow.map((h, i) =>
            typeof h === "string" && h.trim().length > 0 ? h.trim() : `Coluna ${i + 1}`,
          );
        } else {
          const maxColumns = Math.max(0, ...rows.map((r) => r.length));
          nextFileColumns = Array.from({ length: maxColumns }, (_, i) => String(i));
        }
      }

      setParseState((prev) =>
        prev
          ? {
              ...prev,
              hasHeaders: nextHasHeaders,
              fileColumns: nextFileColumns,
            }
          : prev,
      );

      setMapping({
        hasHeaders: nextHasHeaders,
        columnMapping: {},
      });

      setValidatedRows([]);
      setResultErrors([]);
      setShowOnlyInvalid(false);
      setShowOnlyInvalidToggle(false);
      setRevalidationModalOpen(false);
      setRevalidationNotAllowed(false);
      setRevalidationSummary(null);
      setConfirmImportLoading(false);
    },
    [parseState],
  );

  const handleParse = useCallback(async () => {
    if (!file) return;
    try {
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
    } catch (error) {
      showApiErrorToast(error, "Não foi possível fazer o parse do CSV.");
    }
  }, [file, parseMutation, showApiErrorToast]);

  const handleValidate = useCallback(async () => {
    if (!file || !parseState) return;
    try {
      const cleanMapping: Record<string, string | number> = {};
      Object.entries(mapping.columnMapping).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        cleanMapping[key] = value;
      });
      const response = await validateMutation.mutateAsync({ file, mapping: cleanMapping });
      setValidatedRows(response.data);
      setResultErrors([]);
      setShowOnlyInvalidToggle(response.stats.invalid > 0);
      setStep(2);
    } catch (error) {
      showApiErrorToast(error, "Não foi possível validar o arquivo.");
    }
  }, [file, mapping.columnMapping, parseState, showApiErrorToast, validateMutation]);

  const handleRevalidateAndImport = useCallback(async () => {
    if (!validatedRows.length) return;
    try {
      const response = await revalidateMutation.mutateAsync(
        validatedRows.map((r) => r.row),
      );
      setValidatedRows(response.data);
      setResultErrors([]);

      const validRows = response.data.filter(isRowValidForImport);

      // Se houver inválidos, abrir modal.
      if (response.stats.invalid > 0) {
        setRevalidationSummary({
          valid: response.stats.valid,
          invalid: response.stats.invalid,
          limitExceeded: response.stats.limitExceeded,
        });
        setRevalidationNotAllowed(response.stats.valid === 0);
        setRevalidationModalOpen(true);
        return;
      }

      // Sem inválidos: importar tudo.
      if (validRows.length === 0) return;
      const importResult = await importMutation.mutateAsync(response.data.map((r) => r.row));
      setResultStats(importResult.stats);
      setResultErrors(importResult.errors);
      setStep(3);
    } catch (error) {
      showApiErrorToast(error, "Não foi possível revalidar e importar.");
    }
  }, [importMutation, revalidateMutation, showApiErrorToast, validatedRows]);

  const handleConfirmImport = useCallback(async () => {
    if (!revalidationSummary) return;
    if (confirmImportLoading) return;
    setConfirmImportLoading(true);
    try {
      if (validatedRows.length === 0) return;
      // Envia todas as linhas; o backend decide quais ignorar.
      const importResult = await importMutation.mutateAsync(validatedRows.map((r) => r.row));
      setResultStats(importResult.stats);
      setResultErrors(importResult.errors);
      setRevalidationModalOpen(false);
      setRevalidationNotAllowed(false);
      setRevalidationSummary(null);
      setStep(3);
    } catch (error) {
      showApiErrorToast(error, "Não foi possível confirmar a importação.");
    } finally {
      setConfirmImportLoading(false);
    }
  }, [confirmImportLoading, importMutation, revalidationSummary, showApiErrorToast, validatedRows]);

  const handleCancel = () => {
    navigate("/debt-negotiation/debts");
  };

  const handleBack = () => {
    setRevalidationModalOpen(false);
    setRevalidationNotAllowed(false);
    setRevalidationSummary(null);
    setConfirmImportLoading(false);

    setStep((prev) => {
      if (prev <= 0) return prev;

      // Validação -> Mapeamento: zera dados validados (spec).
      if (prev === 2) {
        setValidatedRows([]);
        setResultErrors([]);
        setShowOnlyInvalid(false);
        setShowOnlyInvalidToggle(false);
        return 1 as WizardStep;
      }

      // Mapeamento -> Upload: zera parse/mapeamento/validação (spec).
      if (prev === 1) {
        setParseState(null);
        setValidatedRows([]);
        setResultErrors([]);
        setMapping({ hasHeaders: true, columnMapping: {} });
        setShowOnlyInvalid(false);
        setShowOnlyInvalidToggle(false);
        return 0 as WizardStep;
      }

      return ((prev - 1) as WizardStep);
    });
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
    const currentSelection = mapping.columnMapping[field.key];
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
            value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
            onChange={(event) =>
              setMapping((prev) => ({
                ...prev,
                columnMapping: {
                  ...prev.columnMapping,
                  [field.key]:
                    event.target.value === ""
                      ? null
                      : prev.hasHeaders
                        ? event.target.value
                        : Number(event.target.value),
                },
              }))
            }
          >
            <option value="">{t("pages.debtNegotiation.importDebts.notMapped")}</option>
            {options.map((col) => (
              <option
                key={col}
                value={col}
                disabled={
                  // Evitar mapear a mesma coluna para mais de um campo.
                  mapping.hasHeaders
                    ? // hasHeaders=true: mapping armazena string = header
                      (typeof currentSelection === "string" && currentSelection === col)
                        ? false
                        : Object.entries(mapping.columnMapping).some(
                            ([otherKey, otherColumn]) => {
                              if (otherKey === field.key) return false;
                              return otherColumn === col;
                            },
                          )
                    : // hasHeaders=false: mapping armazena number = índice
                      (typeof currentSelection === "number" && currentSelection === Number(col)) ||
                          (typeof currentSelection === "string" && Number(currentSelection) === Number(col))
                      ? false
                      : Object.entries(mapping.columnMapping).some(
                          ([otherKey, otherColumn]) => {
                            if (otherKey === field.key) return false;
                            return Number(otherColumn) === Number(col);
                          },
                        )
                }
              >
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
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={mapping.hasHeaders}
                  onChange={(event) => handleHasHeadersToggle(event.target.checked)}
                />
                Meu arquivo possui cabeçalhos na primeira linha
              </label>
              {parseState && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Detectado automaticamente como:{" "}
                  <b>{parseState.hasHeaders ? "com cabeçalhos" : "sem cabeçalhos"}</b>
                  .
                </div>
              )}
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
            {showOnlyInvalidToggle && (
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showOnlyInvalid}
                  onChange={(event) => setShowOnlyInvalid(event.target.checked)}
                />
                {t("pages.debtNegotiation.importDebts.showOnlyInvalid")}
              </label>
            )}
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
              {visibleRows.slice(0, 50).map(({ row: item, originalIndex }) => (
                <TableRow
                  key={`${originalIndex}-${Object.keys(item.row).join("-")}`}
                  className={item.errors?._ ? "bg-red-50/50 opacity-80" : undefined}
                  title={item.errors?._}
                >
                  {Object.entries(item.row).map(([key, value]) => {
                    const errorMessage = item.errors?.[key];
                    const hasError = Boolean(errorMessage);
                    const isNonCorrectableRow = Boolean(item.errors?._);
                    return (
                      <TableCell
                        key={key}
                        className={cn(
                          "text-xs",
                          hasError && "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200",
                        )}
                      >
                        {hasError ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex w-full">
                                <Input
                                  value={String(value ?? "")}
                                  onChange={(event) =>
                                    handleInlineCellChange(originalIndex, key, event.target.value)
                                  }
                                  onBlur={() => handleInlineCellBlur(originalIndex, key)}
                                  className="h-7 w-full text-xs"
                                  aria-invalid="true"
                                  disabled={isNonCorrectableRow || revalidationModalOpen}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              {errorMessage}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          value
                        )}
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

  const renderStepResult = () => {
    const preferredKeys = ["contrato", "nome do contato", "whatsapp", "email", "documento"];
    const errorReason = (errs: DebtImportValidationRow["errors"]): string => {
      if (!errs) return "-";
      if (errs._) return errs._;
      const msgs = Object.entries(errs)
        .filter(([k]) => k !== "_")
        .map(([, msg]) => msg);
      return msgs.length ? msgs.join("; ") : "-";
    };

    const firstError = resultErrors[0];
    const columns =
      firstError != null
        ? preferredKeys.filter((k) => Object.prototype.hasOwnProperty.call(firstError.row, k))
        : [];
    const safeColumns = columns.length > 0 ? columns : Object.keys(firstError?.row ?? {}).slice(0, 3);

    return (
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

          {resultErrors.length > 0 && (
            <div className="space-y-3">
              {resultStats?.ignored ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {resultStats.ignored} linhas foram ignoradas devido a erros na importação.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="card-surface overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {safeColumns.map((k) => (
                        <TableHead key={k}>{k}</TableHead>
                      ))}
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultErrors.slice(0, 50).map((e, idx) => (
                      <TableRow key={idx}>
                        {safeColumns.map((k) => (
                          <TableCell key={k} className="text-xs">
                            {e.row[k] ?? "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-xs">{errorReason(e.errors)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
    <DashboardPageLayout
      className="min-w-0"
      showPageHeader
      title={t("pages.debtNegotiation.importDebts.title")}
      subtitle={t("pages.debtNegotiation.importDebts.subtitle")}
      headerActions={
        <span className="inline-flex h-7 items-center rounded-full border border-border px-3 text-xs text-muted-foreground">
          {t("pages.debtNegotiation.importDebts.stepLabel", {
            step: step + 1,
            total: 4,
            label: currentStepLabel,
          })}
        </span>
      }
    >
      {mainContent}

      <Dialog
        open={revalidationModalOpen}
        onOpenChange={(open) => {
          setRevalidationModalOpen(open);
          if (!open) {
            setRevalidationNotAllowed(false);
            setRevalidationSummary(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {revalidationNotAllowed
                ? "Importação não permitida"
                : "Encontramos erros na importação"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            {revalidationNotAllowed ? (
              <p>
                Não encontramos nenhuma linha válida para importar. Corrija os erros e tente novamente.
              </p>
            ) : (
              <>
                <p>
                  Serão importadas <b>{revalidationSummary?.valid ?? 0}</b> linhas válidas e ignoradas{" "}
                  <b>{revalidationSummary?.invalid ?? 0}</b> linhas com erros.
                </p>
                {revalidationSummary?.limitExceeded ? (
                  <p>
                    Limite excedido: <b>{revalidationSummary.limitExceeded}</b>.
                  </p>
                ) : null}
              </>
            )}
          </div>

          <DialogFooter>
            {revalidationNotAllowed ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setRevalidationModalOpen(false)}
              >
                Voltar
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRevalidationModalOpen(false)}
                  disabled={confirmImportLoading}
                >
                  Revisar erros
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleConfirmImport()}
                  disabled={confirmImportLoading}
                >
                  {confirmImportLoading ? "Importando..." : "Confirmar importação"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              disabled={isNextDisabled || (step === 2 && revalidationModalOpen) || confirmImportLoading}
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
    </DashboardPageLayout>
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

