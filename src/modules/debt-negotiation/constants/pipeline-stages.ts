/** ID de estágio usado no fallback do filtro quando a API não envia opções. */
export const PAYMENT_CONFIRMATION_FILTER_STAGE_ID = 11;

export function isRecoveredPipelineStage(stageName: string): boolean {
  return stageName.toLowerCase().trim() === "recuperado";
}
