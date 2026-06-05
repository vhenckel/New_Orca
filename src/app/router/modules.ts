import type { UserPersona } from "@/shared/auth/types";
import type { AppModuleDefinition } from "@/app/router/types";
import { analyticModule } from "@/modules/buyer/analytic";
import { dashboardModule } from "@/modules/buyer/dashboard";
import { quotationModule } from "@/modules/buyer/quotation";
import { productModule } from "@/modules/product";
import { supplierModule as buyerSupplierModule } from "@/modules/buyer/supplier";
import {
  adminBillingModule,
  adminDashboardModule,
  adminRestaurantsModule,
  adminSuppliersModule,
  adminUsersModule,
} from "@/modules/admin";
import { preferencesModule } from "@/shared/preferences";
import {
  supplierCatalogModule,
  supplierCustomersModule,
  supplierDashboardModule,
  supplierMobileQuotationModule,
  supplierQuotationModule,
} from "@/modules/supplier";

/** Produtos: módulo em `@/modules/product` (admin + establishment; supplier não acessa). */
export const buyerModules: AppModuleDefinition[] = [
  dashboardModule,
  quotationModule,
  productModule,
  buyerSupplierModule,
  analyticModule,
];

export const sharedModules: AppModuleDefinition[] = [preferencesModule];

export const supplierModules: AppModuleDefinition[] = [
  supplierDashboardModule,
  supplierQuotationModule,
  supplierCatalogModule,
  supplierCustomersModule,
];

export const supplierMobileModules: AppModuleDefinition[] = [supplierMobileQuotationModule];

export const adminModules: AppModuleDefinition[] = [
  adminDashboardModule,
  productModule,
  adminUsersModule,
  adminRestaurantsModule,
  adminSuppliersModule,
  adminBillingModule,
];

export function getModulesForPersona(persona: UserPersona): AppModuleDefinition[] {
  if (persona === "admin") return adminModules;
  return persona === "supplier" ? supplierModules : buyerModules;
}

export function getMobileModulesForPersona(persona: UserPersona): AppModuleDefinition[] {
  if (persona === "supplier") {
    return supplierMobileModules;
  }
  return [];
}
