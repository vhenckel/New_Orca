import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { TranslationKey } from "@/shared/i18n/config";

export interface AppRouteDefinition {
  path: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
  element: ReactNode;
  /** Se true, a rota não aparece no menu lateral (ex.: página de detalhe acessada por link). */
  hideInSidebar?: boolean;
  /** Exige autenticação (default true para rotas de negócio). */
  requiresAuth?: boolean;
  /** Nomes de permissão (qualquer uma habilitada). Se vazio/undefined, não checa permissão. */
  requiredPermissions?: string[];
  /** TopBar: período (datas) na URL para o módulo. */
  showDebtNegotiationDateRangeInTopBar?: boolean;
  /** TopBar: atalho importar dívidas. */
  showImportDebtsInTopBar?: boolean;
}

export interface AppModuleDefinition {
  key: string;
  basePath: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
  routes: AppRouteDefinition[];
}
