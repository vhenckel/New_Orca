import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";

interface ModulePlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryActionLabel?: string;
  /** Quando true, não repete título/eyebrow (use com `DashboardPageLayout` no pai). */
  headerInLayout?: boolean;
}

export function ModulePlaceholderPage({
  eyebrow,
  title,
  description,
  primaryActionLabel,
  headerInLayout = false,
}: ModulePlaceholderPageProps) {
  const { t } = useI18n();

  if (headerInLayout) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("common.placeholder.description")}</p>
          <Button size="sm" variant="outline">
            {primaryActionLabel ?? t("common.comingSoon")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </span>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("common.placeholder.description")}</p>
        <Button size="sm" variant="outline">
          {primaryActionLabel ?? t("common.comingSoon")}
        </Button>
      </CardContent>
    </Card>
  );
}
