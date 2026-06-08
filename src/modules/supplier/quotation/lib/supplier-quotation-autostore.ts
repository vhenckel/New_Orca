const STORAGE_PREFIX = "supplier-budget:";
const DRAFT_VERSION = 1;
const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface SupplierQuotationCommercialTerms {
  paymentMethod: string;
  paymentDeadline: string;
  delivery: string;
  quotationValidUntil: string;
}

export interface SupplierQuotationAlternativeLine {
  id: string;
  parentItemId: string;
  brand: string;
  packagingAmount: string;
  packagingUnit: string;
}

export interface SupplierQuotationLineResponse {
  unitPrice: string;
  customBrand?: string;
  observation?: string;
}

export interface SupplierQuotationDraftState {
  responses: Record<string, SupplierQuotationLineResponse>;
  commercialTerms: SupplierQuotationCommercialTerms;
  generalNotes: string;
  alternativeLines: SupplierQuotationAlternativeLine[];
}

interface StoredDraft extends SupplierQuotationDraftState {
  version: number;
  updatedAt: string;
}

function storageKey(quotationId: string): string {
  return `${STORAGE_PREFIX}${quotationId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCommercialTerms(value: unknown): value is SupplierQuotationCommercialTerms {
  if (!isRecord(value)) return false;
  return (
    typeof value.paymentMethod === "string" &&
    typeof value.paymentDeadline === "string" &&
    typeof value.delivery === "string" &&
    typeof value.quotationValidUntil === "string"
  );
}

function isLineResponse(value: unknown): value is SupplierQuotationLineResponse {
  if (!isRecord(value)) return false;
  if (typeof value.unitPrice !== "string") return false;
  if (value.customBrand !== undefined && typeof value.customBrand !== "string") return false;
  if (value.observation !== undefined && typeof value.observation !== "string") return false;
  return true;
}

function isAlternativeLine(value: unknown): value is SupplierQuotationAlternativeLine {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.parentItemId === "string" &&
    typeof value.brand === "string" &&
    typeof value.packagingAmount === "string" &&
    typeof value.packagingUnit === "string"
  );
}

function isDraftState(value: unknown): value is SupplierQuotationDraftState {
  if (!isRecord(value)) return false;
  if (!isRecord(value.responses)) return false;
  if (!isCommercialTerms(value.commercialTerms)) return false;
  if (typeof value.generalNotes !== "string") return false;
  if (!Array.isArray(value.alternativeLines)) return false;
  if (!Object.values(value.responses).every(isLineResponse)) return false;
  if (!value.alternativeLines.every(isAlternativeLine)) return false;
  return true;
}

function isStoredDraftFresh(updatedAt: string): boolean {
  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) return false;
  return Date.now() - parsed <= DRAFT_MAX_AGE_MS;
}

function parseStoredDraft(raw: string): SupplierQuotationDraftState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  if (parsed.version === DRAFT_VERSION) {
    if (typeof parsed.updatedAt !== "string" || !isStoredDraftFresh(parsed.updatedAt)) {
      return null;
    }
    const { version: _v, updatedAt: _u, ...state } = parsed as StoredDraft;
    return isDraftState(state) ? state : null;
  }

  return isDraftState(parsed) ? parsed : null;
}

export function loadDraft(quotationId: string): SupplierQuotationDraftState | null {
  try {
    const raw = localStorage.getItem(storageKey(quotationId));
    if (!raw) return null;

    const draft = parseStoredDraft(raw);
    if (!draft) {
      localStorage.removeItem(storageKey(quotationId));
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(quotationId: string, state: SupplierQuotationDraftState): void {
  try {
    const stored: StoredDraft = {
      ...state,
      version: DRAFT_VERSION,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey(quotationId), JSON.stringify(stored));
  } catch {
    // ignore
  }
}

export function clearDraft(quotationId: string): void {
  try {
    localStorage.removeItem(storageKey(quotationId));
  } catch {
    // ignore
  }
}

export function hasDraft(quotationId: string): boolean {
  return loadDraft(quotationId) !== null;
}
