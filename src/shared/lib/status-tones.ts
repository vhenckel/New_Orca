import { cn } from "@/shared/lib/utils";

export type SemanticTone = "positive" | "negative" | "warning" | "info" | "neutral";

export function toneBadgeClass(tone: "positive" | "negative") {
  return tone === "positive"
    ? "border-success/20 bg-success/10 text-success"
    : "border-destructive/20 bg-destructive/10 text-destructive";
}

export function quotationBadgeClass(tone: "info" | "warning" | "success") {
  if (tone === "success") return "border-success/20 bg-success/10 text-success";
  if (tone === "warning") return "border-warning/30 bg-warning/10 text-warning";
  return "border-info/20 bg-info/10 text-info";
}

export function actionCardClass(tone: "warning" | "danger" | "info") {
  if (tone === "danger") return "border-destructive/20 bg-destructive/10";
  if (tone === "warning") return "border-warning/30 bg-warning/10";
  return "border-info/20 bg-info/10";
}

export function highlightedKpiClass(highlighted?: boolean) {
  return cn(
    highlighted && "border-primary/30 bg-primary/5",
  );
}

export function highlightedKpiValueClass(highlighted?: boolean) {
  return cn(highlighted && "text-primary");
}

export const INFO_BADGE = "border-info/20 bg-info/10 text-info";
export const WARNING_BADGE = "border-warning/30 bg-warning/10 text-warning";
export const SUCCESS_BADGE = "border-success/20 bg-success/10 text-success";
export const DESTRUCTIVE_BADGE = "border-destructive/20 bg-destructive/10 text-destructive";

export const INFO_SURFACE = "border-info/20 bg-info/10 text-foreground";
export const WARNING_SURFACE = "border-warning/30 bg-warning/10 text-foreground";
export const DESTRUCTIVE_SURFACE = "border-destructive/20 bg-destructive/10 text-foreground";
