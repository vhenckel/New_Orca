import { analyticModule } from "@/modules/analytic";
import { configModule } from "@/modules/config";
import { dashboardModule } from "@/modules/dashboard";
import { productModule } from "@/modules/product";
import { quotationModule } from "@/modules/quotation";
import { supplierModule } from "@/modules/supplier";

export const businessModules = [
  dashboardModule,
  quotationModule,
  productModule,
  supplierModule,
  analyticModule,
  configModule,
];
