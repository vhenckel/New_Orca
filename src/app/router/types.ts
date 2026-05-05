import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { UserPersona } from "@/shared/auth/types";
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
  /** TopBar: filtro mês/ano (repasses / conciliação financeira). */
  showPayoutMonthYearInTopBar?: boolean;
  /**
   * TopBar em 3 níveis: Módulo → intermediário (link) → página atual.
   * Sem isso: só Módulo + título da rota.
   */
  topBarParent?: {
    labelKey: TranslationKey;
    /** Pathname do nível intermediário (sem query). */
    path: string;
    /** Se true, repassa `location.search` ao navegar para o pai (ex.: período na URL). */
    preserveSearch?: boolean;
  };
}

export interface AppModuleDefinition {
  key: string;
  basePath: string;
  /**
   * Destino do clique no item do módulo na sidebar (default: `basePath`).
   * Use quando `basePath` for só prefixo e a landing for outra rota.
   */
  sidebarLinkTo?: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
  /** Se true, o módulo nao aparece no menu lateral. */
  hideInSidebar?: boolean;
  /**
   * Personas autorizadas a acessar este módulo. Se vazio/undefined, qualquer persona acessa.
   * Usado pelo RouteGuard para bloquear cross-persona e pelo AppRouter para filtrar rotas.
   */
  allowedPersonas?: UserPersona[];
  /**
   * Módulo exclusivo de layout mobile (rotas /m/...). AppRouter usa `MobileShell` em vez de `AppShell`.
   */
  isMobile?: boolean;
  routes: AppRouteDefinition[];
}
