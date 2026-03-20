import { collectionsModule } from "@/modules/collections";
import { debtNegotiationModule } from "@/modules/debt-negotiation";
import { financeModule } from "@/modules/finance";
import { salesModule } from "@/modules/sales";
import { settingsModule } from "@/modules/settings";
import { agentModule } from "@/modules/agent";

export const businessModules = [
  debtNegotiationModule,
  financeModule,
  collectionsModule,
  salesModule,
  agentModule,
  settingsModule,
];
