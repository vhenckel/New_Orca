import { collectionsModule } from "@/modules/collections";
import { configModule } from "@/modules/config";
import { contactModule } from "@/modules/contact";
import { debtNegotiationModule } from "@/modules/debt-negotiation";
import { financeModule } from "@/modules/finance";
import { salesModule } from "@/modules/sales";
import { settingsModule } from "@/modules/settings";

export const businessModules = [
  contactModule,
  debtNegotiationModule,
  financeModule,
  collectionsModule,
  salesModule,
  settingsModule,
  configModule,
];
