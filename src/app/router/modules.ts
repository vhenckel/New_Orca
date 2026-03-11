import { collectionsModule } from "@/modules/collections";
import { debtNegotiationModule } from "@/modules/debt-negotiation";
import { salesModule } from "@/modules/sales";
import { settingsModule } from "@/modules/settings";

export const businessModules = [
  debtNegotiationModule,
  collectionsModule,
  salesModule,
  settingsModule,
];
