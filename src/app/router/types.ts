import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { TranslationKey } from "@/shared/i18n/config";

export interface AppRouteDefinition {
  path: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
  element: ReactNode;
}

export interface AppModuleDefinition {
  key: string;
  basePath: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
  routes: AppRouteDefinition[];
}
