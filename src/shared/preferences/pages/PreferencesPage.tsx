import { Check, Moon, RotateCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import {
  ORCA_ORANGE,
  ORCA_PETROLEUM,
} from "@/shared/theme/brand-colors";
import { defaultAccentColor } from "@/shared/theme/accent-color";
import { useAccentColor } from "@/shared/theme/useAccentColor";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const themeOptions = [
  { value: "dark", labelKey: "app.preferences.theme.dark", icon: Moon },
  { value: "light", labelKey: "app.preferences.theme.light", icon: Sun },
] as const;

export function PreferencesPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const { accentColor, setAccentColor, resetAccentColor, isDefaultAccent } = useAccentColor();

  return (
    <DashboardPageLayout
      className="mx-auto max-w-4xl"
      showPageHeader
      title={t("app.preferences.title")}
      subtitle={t("app.preferences.description")}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              <CardTitle>{t("app.preferences.theme.title")}</CardTitle>
            </div>
            <CardDescription>{t("app.preferences.theme.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-accent",
                  resolvedTheme === option.value && "border-primary bg-primary/10",
                )}
              >
                <span className="flex items-center gap-3">
                  <option.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{t(option.labelKey)}</span>
                </span>
                <Check
                  className={cn(
                    "h-4 w-4 text-primary transition-opacity",
                    resolvedTheme === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{t("app.preferences.color.title")}</CardTitle>
            <CardDescription>{t("app.preferences.color.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <span
                className="size-10 shrink-0 rounded-lg border border-white/10 shadow-sm"
                style={{ backgroundColor: ORCA_PETROLEUM }}
                aria-hidden
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">
                  {t("app.preferences.color.brandFixed")}
                </p>
                <p className="font-mono text-xs uppercase text-muted-foreground">{ORCA_PETROLEUM}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="h-12 w-16 cursor-pointer rounded-md border border-border bg-transparent p-1"
                    aria-label={t("app.preferences.color.accentLabel")}
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("app.preferences.color.accentLabel")}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-4 rounded-full border border-border"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="font-mono text-sm uppercase text-muted-foreground">
                        {accentColor}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetAccentColor}
                  disabled={isDefaultAccent}
                  className="shrink-0"
                >
                  <RotateCcw className="size-4" />
                  {t("app.preferences.color.reset")}
                </Button>
              </div>

              <Input
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                placeholder={defaultAccentColor}
                maxLength={7}
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                {t("app.preferences.color.resetHint", { default: defaultAccentColor })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed shadow-card">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t("app.preferences.savedHint")}</p>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
