import { Bot, Percent, Radio, Settings2 } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { AgentSettingsPage } from "@/modules/settings/pages/AgentSettingsPage";
import { ChannelsPage } from "@/modules/settings/pages/ChannelsPage";
import { RenegotiationSettingsPage } from "@/modules/settings/pages/RenegotiationSettingsPage";

export const settingsModule: AppModuleDefinition = {
  key: "settings",
  basePath: "/settings",
  sidebarLinkTo: "/settings/agent",
  titleKey: "modules.settings.title",
  descriptionKey: "modules.settings.description",
  icon: Settings2,
  routes: [
    {
      path: "/settings/agent",
      labelKey: "modules.settings.routes.agent.label",
      descriptionKey: "modules.settings.routes.agent.description",
      icon: Bot,
      element: <AgentSettingsPage />,
    },
    {
      path: "/settings/renegotiation",
      labelKey: "modules.settings.routes.renegotiation.label",
      descriptionKey: "modules.settings.routes.renegotiation.description",
      icon: Percent,
      element: <RenegotiationSettingsPage />,
    },
    {
      path: "/settings/channels",
      labelKey: "modules.settings.routes.channels.label",
      descriptionKey: "modules.settings.routes.channels.description",
      icon: Radio,
      element: <ChannelsPage />,
    },
  ],
};
