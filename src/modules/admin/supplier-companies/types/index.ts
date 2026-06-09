export type SupplierCompanySortField = "name" | "supplierCount";
export type SortOrder = "ASC" | "DESC";

export interface SupplierCompanyListItem {
  id: string;
  name: string;
  minimumOrderValue: string;
  allowSupplierMinimumOrderCustomization: boolean;
  supplierCount: number;
}

export interface SupplierCompanySegment {
  id: string;
  name: string;
}

export interface SupplierCompanySupplierSummary {
  id: string;
  name: string;
  minimumOrderValue?: string | null;
}

export interface SupplierCompanyDetail {
  id: string;
  name: string;
  minimumOrderValue: string;
  allowSupplierMinimumOrderCustomization: boolean;
  segments: SupplierCompanySegment[];
  suppliers: SupplierCompanySupplierSummary[];
}

export interface SupplierCompaniesListPage {
  data: SupplierCompanyListItem[];
  total: number;
  page: number;
  totalPerPage: number;
  maxPerPage: number;
}

export interface FetchSupplierCompaniesListParams {
  page: number;
  totalPerPage?: number;
  name?: string;
  sort?: SupplierCompanySortField;
  order?: SortOrder;
}

export const SUPPLIER_COMPANIES_LIST_DEFAULT_PARAMS = {
  totalPerPage: 15,
  sort: "name" as SupplierCompanySortField,
  order: "ASC" as SortOrder,
};

export interface SupplierCompanyPayload {
  name: string;
  minimumOrderValue: string;
  allowSupplierMinimumOrderCustomization: boolean;
  segmentIds: string[];
  supplierIds: string[];
}
