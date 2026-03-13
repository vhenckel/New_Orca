export type DebtImportFieldType =
  | "string"
  | "phone"
  | "email"
  | "cpf"
  | "cpf/cnpj"
  | "currency"
  | "date";

export interface DebtImportFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  type: DebtImportFieldType;
  description: string;
  example: string;
  synonyms?: string[];
}

export interface DebtImportParseResponse {
  fileColumns: string[];
  hasHeaders: boolean;
  suggestedMapping: Record<string, string>;
  preview: Array<Record<string, unknown>>;
  stats: {
    totalRows: number;
    totalColumns: number;
  };
}

export interface DebtImportValidationRow {
  row: Record<string, string>;
  errors?: Record<string, string>;
}

export interface DebtImportValidateResponse {
  data: DebtImportValidationRow[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    limitExceeded: number;
  };
  context: {
    planType: string;
    planName: string;
    minimalValue: number;
    maximumAge: number | null;
    availableLimit: number;
  };
}

export interface DebtImportResult {
  errors: DebtImportValidationRow[];
  stats: {
    total: number;
    imported: number;
    ignored: number;
  };
}

