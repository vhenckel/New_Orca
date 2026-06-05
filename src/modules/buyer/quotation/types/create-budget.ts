import type { BudgetStatus } from "@/modules/buyer/quotation/types/budget";

export interface EstablishmentOption {
  id: string;
  name: string;
}

export interface EstablishmentProductBrand {
  id: string;
  name: string;
  status?: string;
}

export interface EstablishmentProductSegment {
  id: string;
  name: string;
}

export interface EstablishmentProductPackaging {
  unit: string;
  weight: number;
}

export interface EstablishmentProduct {
  id: string;
  establishmentProductId: string;
  name: string;
  unitType: string;
  packagingUnit?: EstablishmentProductPackaging | null;
  quoteAnyBrand: boolean;
  brands: EstablishmentProductBrand[];
  segments: EstablishmentProductSegment[];
  establishment: EstablishmentOption;
}

export interface BudgetProductPayloadItem {
  id?: string;
  productId: string;
  quantity: number;
  brandIds: string[];
  quoteAnyBrand: boolean;
  observation?: string | null;
}

export interface CreateBudgetPayload {
  establishmentId: string;
  deadline: string;
  deliveryTime?: string;
  observation?: string | null;
  items: BudgetProductPayloadItem[];
}

export interface UpdateBudgetPayload {
  deadline: string;
  deliveryTime?: string;
  observation?: string | null;
  items: BudgetProductPayloadItem[];
}

export interface BudgetDetailItem {
  id: string;
  name: string;
  productId: string;
  quantity: number;
  unitType: string;
  packagingUnit?: EstablishmentProductPackaging | null;
  observation?: string | null;
  brands: EstablishmentProductBrand[];
  quoteAnyBrand: boolean;
}

export interface BudgetDetail {
  id: string;
  /** Nome do orçamento (quando a API retornar). */
  name?: string;
  deadline: string;
  deliveryTime?: string;
  observation?: string | null;
  status: BudgetStatus;
  establishment: EstablishmentOption;
  items: BudgetDetailItem[];
  createdAt?: string;
}

export type BudgetMutationResponse = BudgetDetail;

export interface SendBudgetResponse {
  message: string;
}
