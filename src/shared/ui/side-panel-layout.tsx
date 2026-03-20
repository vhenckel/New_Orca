import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import {
  SidePanelBody,
  SidePanelFooter,
  SidePanelHeader,
} from "@/shared/ui/side-panel";

export type SidePanelLayoutProps = {
  header?: ReactNode;
  /** Ações de voltar/cancelar (lado esquerdo). */
  footerLeft?: ReactNode;
  /** Ação de confirmacao (lado direito). */
  footerRight?: ReactNode;
  /** Back-compat: footer customizado (sem separacao left/right). */
  footer?: ReactNode;
  children?: ReactNode;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
};

/**
 * Layout padrao para drawers laterais:
 * - header fixo no topo
 * - body com overflow (role dentro)
 * - footer fixo no rodape
 */
export function SidePanelLayout({
  header,
  footerLeft,
  footerRight,
  footer,
  children,
  bodyClassName,
  headerClassName,
  footerClassName,
}: SidePanelLayoutProps) {
  const useLeftRight = footerLeft != null || footerRight != null;

  return (
    <>
      {header != null ? (
        <SidePanelHeader className={cn(headerClassName)}>{header}</SidePanelHeader>
      ) : null}
      <SidePanelBody className={cn(bodyClassName)}>{children}</SidePanelBody>
      {useLeftRight ? (
        <SidePanelFooter className={cn(footerClassName)}>
          <div className="flex flex-1 items-center gap-2">{footerLeft}</div>
          <div className="flex flex-1 items-center justify-end gap-2">{footerRight}</div>
        </SidePanelFooter>
      ) : footer != null ? (
        <SidePanelFooter className={cn(footerClassName)}>{footer}</SidePanelFooter>
      ) : null}
    </>
  );
}

