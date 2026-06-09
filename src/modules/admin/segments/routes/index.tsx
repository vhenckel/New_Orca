import { Tags } from "lucide-react";

import type { AppModuleDefinition } from "@/app/router/types";
import { SegmentFormPage } from "@/modules/admin/segments/pages/SegmentFormPage";
import { SegmentsPage } from "@/modules/admin/segments/pages/SegmentsPage";

export const adminSegmentsModule: AppModuleDefinition = {
  key: "admin-segments",
  basePath: "/segmentos",
  allowedPersonas: ["admin"],
  titleKey: "modules.admin.segments.title",
  descriptionKey: "modules.admin.segments.description",
  icon: Tags,
  routes: [
    {
      path: "/segmentos",
      labelKey: "modules.admin.segments.routes.main.label",
      descriptionKey: "modules.admin.segments.routes.main.description",
      icon: Tags,
      element: <SegmentsPage />,
      allowedApiRoles: ["admin"],
    },
    {
      path: "/segmentos/criar-segmento",
      labelKey: "modules.admin.segments.routes.create.label",
      descriptionKey: "modules.admin.segments.routes.create.description",
      icon: Tags,
      element: <SegmentFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.segments.routes.main.label",
        path: "/segmentos",
      },
    },
    {
      path: "/segmentos/editar-segmento/:id",
      labelKey: "modules.admin.segments.routes.edit.label",
      descriptionKey: "modules.admin.segments.routes.edit.description",
      icon: Tags,
      element: <SegmentFormPage />,
      hideInSidebar: true,
      allowedApiRoles: ["admin"],
      topBarParent: {
        labelKey: "modules.admin.segments.routes.main.label",
        path: "/segmentos",
      },
    },
  ],
};
