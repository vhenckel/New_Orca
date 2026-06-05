import type { MeResponse } from "@/shared/auth/types";
import {
  applyAccentColor,
  getEffectiveAccentColor,
} from "@/shared/theme/accent-color";

/**
 * Aplica a cor de destaque da plataforma.
 * Só usa valor salvo se o usuário personalizou em Preferências; ignora branding da empresa no carregamento.
 */
export function applyResolvedAccentColor(_me: MeResponse | null): void {
  applyAccentColor(getEffectiveAccentColor());
}
