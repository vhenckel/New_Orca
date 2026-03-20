import { Bot } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { RenegotiationConfigPage } from "@/modules/agent/pages/RenegotiationConfigPage";

export const agentModule: AppModuleDefinition = {
  key: "agent",
  basePath: "/agent/renegotiation-config",
  titleKey: "modules.agent.title",
  descriptionKey: "modules.agent.description",
  icon: Bot,
  routes: [
    {
      path: "/agent/renegotiation-config",
      labelKey: "modules.agent.routes.renegotiationConfig.label",
      descriptionKey: "modules.agent.routes.renegotiationConfig.description",
      icon: Bot,
      element: <RenegotiationConfigPage />,
    },
  ],
};

