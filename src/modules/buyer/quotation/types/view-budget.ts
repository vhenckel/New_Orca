import type { EstablishmentProductPackaging } from "@/modules/buyer/quotation/types/create-budget";

export interface BudgetViewBrand {
  id: string;
  name: string;
}

export interface BudgetSummary {
  responseCount: number;
  orderCount: number;
  orderTotal: number;
  cheaperTotal: number;
  mostExpensiveTotal: number;
  totalDifference: number;
  totalSavings: number;
}

export interface BudgetViewProduct {
  id: string;
  name: string;
  quantity: number;
  unitType: string;
  packagingUnit?: EstablishmentProductPackaging | null;
  brands: BudgetViewBrand[];
  supplier: string | null;
  observation: string | null;
  unitValue: number | null;
  totalValue: number | null;
  lowestValue: number | null;
  differenceValue: number | null;
  paymentTerm: string | null;
  deliveryDeadline: string | null;
  expirationDate: string | null;
  missingValue: number;
  differentFromRequest: boolean;
  hasDifferentFromRequest: boolean;
  selectedBrandName: string | null;
}

export interface BudgetViewSupplierResponsible {
  name: string;
  email: string;
}

export interface BudgetViewSupplier {
  id: string;
  name: string;
  responsible: BudgetViewSupplierResponsible;
  phone: string;
  minimumOrderValue: number;
  responseDate?: string;
  observation?: string;
}

export type ProductQuotationSortField = "value" | "supplier" | "missing_value" | "brand";

export type ProductQuotationSortOrder = "ASC" | "DESC";

export interface ProductQuotation {
  id: string;
  isSelected: boolean;
  brand: BudgetViewBrand | null;
  supplier: string;
  observation: string | null;
  packagingUnit?: EstablishmentProductPackaging | null;
  unitValue: number;
  totalValue: number;
  differenceCheapest: number;
  paymentTerm: string | null;
  deliveryDeadline: string | null;
  expirationDate: string | null;
  missingValue: number;
  differentFromRequest: boolean;
}

export interface SelectQuotationPayload {
  quotationItemId?: string;
}

export interface BudgetMessageResponse {
  message: string;
}

export interface BudgetOrderProduct {
  productName: string;
  pricePerUnit?: number;
  unit: string;
  packagingUnit?: EstablishmentProductPackaging | null;
  productTotalPrice: number;
  quantity: number;
  brand?: string;
}

export interface BudgetOrderSupplier {
  id: string;
  name: string;
  phone: string;
  responsible: {
    email: string;
  };
}

export interface BudgetOrderItem {
  id: string;
  supplier: BudgetOrderSupplier;
  establishmentName: string;
  responsibleName: string;
  phone: string;
  paymentMethod?: string;
  totalPrice: number;
  observation?: string;
  products: BudgetOrderProduct[];
}

export type BudgetOrder = BudgetOrderItem[];
