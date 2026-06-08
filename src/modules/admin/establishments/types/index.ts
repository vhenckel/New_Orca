import type { PaginatedResponse } from "@/shared/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

export type EstablishmentPaymentStatus = "pending" | "paid" | "late_payment" | "canceled";
export type EstablishmentSortField = "name";
export type SortOrder = "ASC" | "DESC";
export type LinkedUserUpdateScope = "current" | "all";

export interface EstablishmentAddress {
  zipCode?: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
}

export interface EstablishmentListItem {
  id: string;
  name: string;
  responsibleName: string;
  phone: string;
  address?: EstablishmentAddress | null;
  status: EstablishmentPaymentStatus;
  active: boolean;
}

export interface EstablishmentParent {
  id: string;
  name: string;
  cnpj?: string;
}

export interface EstablishmentDetail {
  id: string;
  name: string;
  cnpj: string;
  status: EstablishmentPaymentStatus;
  responsible: { name: string; email: string };
  active: boolean;
  phone: string;
  address?: EstablishmentAddress | null;
  parentEstablishment?: EstablishmentParent | null;
  ownerLinkedEntityCount?: number;
}

export type EstablishmentsListPage = PaginatedResponse<EstablishmentListItem>;

export interface FetchEstablishmentsListParams {
  page: number;
  totalPerPage?: number;
  sort?: EstablishmentSortField;
  order?: SortOrder;
  name?: string;
  responsibleName?: string;
  phone?: string;
  addressState?: string;
  addressCity?: string;
  addressNeighborhood?: string;
  status?: EstablishmentPaymentStatus;
  active?: boolean;
  supplierId?: string;
  productId?: string;
}

export interface CreateEstablishmentPayload {
  name: string;
  cnpj: string;
  status: EstablishmentPaymentStatus;
  responsible: { name: string; email: string };
  active: boolean;
  phone: string;
  address?: EstablishmentAddress | null;
  parentEstablishmentId?: string | null;
}

export interface UpdateEstablishmentPayload extends CreateEstablishmentPayload {
  linkedUserUpdateScope?: LinkedUserUpdateScope;
}

export interface EstablishmentSearchOption {
  id: string;
  name: string;
  cnpj?: string;
}

export const ESTABLISHMENTS_LIST_DEFAULT_PARAMS = {
  totalPerPage: DEFAULT_PAGE_SIZE,
  sort: "name" as EstablishmentSortField,
  order: "ASC" as SortOrder,
};
