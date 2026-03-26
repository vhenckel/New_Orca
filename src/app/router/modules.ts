import { collectionsModule } from "@/modules/collections";
import { contactModule } from "@/modules/contact";
import { debtNegotiationModule } from "@/modules/debt-negotiation";
import { financeModule } from "@/modules/finance";
import { salesModule } from "@/modules/sales";
import { settingsModule } from "@/modules/settings";
import { agentModule } from "@/modules/agent";

export const businessModules = [
  contactModule,
  debtNegotiationModule,
  financeModule,
  collectionsModule,
  salesModule,
  agentModule,
  settingsModule,
];
