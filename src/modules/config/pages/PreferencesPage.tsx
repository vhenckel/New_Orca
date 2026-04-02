import { Check, Languages, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { useAccentColor } from "@/shared/theme/useAccentColor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const themeOptions = [
  { value: "dark", labelKey: "app.preferences.theme.dark", icon: Moon },
  { value: "light", labelKey: "app.preferences.theme.light", icon: Sun },
] as const;

const languageOptions = [
  { value: "pt-BR", labelKey: "app.preferences.language.pt-BR" },
  { value: "en-US", labelKey: "app.preferences.language.en-US" },
] as const;

export function PreferencesPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { accentColor, setAccentColor } = useAccentColor();

  return (
    <DashboardPageLayout
      className="mx-auto max-w-4xl"
      showPageHeader
      title={t("modules.config.routes.preferences.label")}
      subtitle={t("modules.config.routes.preferences.description")}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              <CardTitle>{t("app.preferences.language.title")}</CardTitle>
            </div>
            <CardDescription>{t("app.preferences.language.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocale(option.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-accent",
                  locale === option.value && "border-primary bg-primary/10",
                )}
              >
                <span className="font-medium text-foreground">{t(option.labelKey)}</span>
                <Check
                  className={cn(
                    "h-4 w-4 text-primary transition-opacity",
                    locale === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("app.preferences.color.title")}</CardTitle>
            <CardDescription>{t("app.preferences.color.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                className="h-12 w-16 cursor-pointer rounded-md border border-border bg-transparent p-1"
                aria-label={t("app.preferences.color.title")}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{t("app.preferences.color.current")}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="font-mono text-sm text-muted-foreground uppercase">{accentColor}</span>
                </div>
              </div>
            </div>

            <Input
              value={accentColor}
              onChange={(event) => setAccentColor(event.target.value)}
              placeholder="#6467f2"
              maxLength={7}
              className="font-mono uppercase"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t("app.preferences.savedHint")}</p>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
