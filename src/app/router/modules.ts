import type { UserPersona } from "@/shared/auth/types";
import type { AppModuleDefinition } from "@/app/router/types";
import { analyticModule } from "@/modules/buyer/analytic";
import { configModule } from "@/modules/buyer/config";
import { dashboardModule } from "@/modules/buyer/dashboard";
import { productModule } from "@/modules/buyer/product";
import { quotationModule } from "@/modules/buyer/quotation";
import { supplierModule as buyerSupplierModule } from "@/modules/buyer/supplier";
import {
  supplierCatalogModule,
  supplierCustomersModule,
  supplierDashboardModule,
  supplierMobileQuotationModule,
  supplierQuotationModule,
} from "@/modules/supplier";

export const buyerModules: AppModuleDefinition[] = [
  dashboardModule,
  quotationModule,
  productModule,
  buyerSupplierModule,
  analyticModule,
  configModule,
];

export const supplierModules: AppModuleDefinition[] = [
  supplierDashboardModule,
  supplierQuotationModule,
  supplierCatalogModule,
  supplierCustomersModule,
];

export const supplierMobileModules: AppModuleDefinition[] = [supplierMobileQuotationModule];

export function getModulesForPersona(persona: UserPersona): AppModuleDefinition[] {
  return persona === "supplier" ? supplierModules : buyerModules;
}

export function getMobileModulesForPersona(persona: UserPersona): AppModuleDefinition[] {
  if (persona === "supplier") {
    return supplierMobileModules;
  }
  return [];
}
