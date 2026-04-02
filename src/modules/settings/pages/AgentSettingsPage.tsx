import { useI18n } from "@/shared/i18n/useI18n";
import { useAuth } from "@/shared/auth/AuthContext";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

import { RenegotiationConfigFormRow } from "@/modules/settings/components/RenegotiationConfigFormRow";
import { useRenegotiationConfigForm } from "@/modules/settings/hooks/useRenegotiationConfigForm";

export function AgentSettingsPage() {
  const { t } = useI18n();
  const { companyId } = useAuth();
  const {
    form,
    setForm,
    setIsDirty,
    isLoading,
    error,
    updateMutation,
    agentNameWarning,
    isAgentSectionDirty,
    saveSection,
  } = useRenegotiationConfigForm(companyId);

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.settings.routes.agent.label")}
      subtitle={t("modules.settings.routes.agent.description")}
    >
      <div className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("modules.settings.renegotiationConfig.errorLoading")}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="w-full">
          {isLoading || !form ? (
            <div className="p-6 text-sm text-muted-foreground">
              {t("modules.settings.renegotiationConfig.loading")}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-2xl pt-0">
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t("modules.settings.renegotiationConfig.agentSection.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("modules.settings.renegotiationConfig.agentSection.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid flex-1 gap-3 pt-0">
                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.agentName.label")}
                    warning={agentNameWarning}
                    info={t("modules.settings.renegotiationConfig.fields.agentName.info")}
                    className="py-2"
                  >
                    <Input
                      value={form.agentName}
                      aria-invalid={Boolean(agentNameWarning)}
                      onChange={(e) => {
                        setForm((prev) =>
                          prev ? { ...prev, agentName: e.target.value } : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.companyDetails.label")}
                    info={t("modules.settings.renegotiationConfig.fields.companyDetails.info")}
                    className="py-2"
                  >
                    <Textarea
                      value={form.companyDetails}
                      onChange={(e) => {
                        setForm((prev) =>
                          prev ? { ...prev, companyDetails: e.target.value } : prev,
                        );
                        setIsDirty(true);
                      }}
                      rows={6}
                      className="min-h-[220px] resize-none"
                    />
                  </RenegotiationConfigFormRow>
                </CardContent>
                <CardFooter className="mt-auto justify-end border-t border-border/60 pt-4">
                  <Button
                    disabled={
                      !isAgentSectionDirty ||
                      Boolean(agentNameWarning) ||
                      updateMutation.isPending
                    }
                    onClick={() => saveSection("agent")}
                  >
                    {updateMutation.isPending
                      ? t("modules.settings.renegotiationConfig.actions.saving")
                      : t("modules.settings.renegotiationConfig.actions.save")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
