import { useState } from "react";

import type { ChannelModel } from "@/modules/settings/types/channel";
import { ChannelMetricsCards } from "@/modules/settings/components/channels/ChannelMetricsCards";
import { ChannelTableSection } from "@/modules/settings/components/channels/ChannelTableSection";
import { CreateChannelSheet } from "@/modules/settings/components/channels/CreateChannelSheet";
import { EditChannelSheet } from "@/modules/settings/components/channels/EditChannelSheet";
import { useChannelBotsQuery } from "@/modules/settings/hooks/useChannelBotsQuery";
import { useChannelsQuery } from "@/modules/settings/hooks/useChannelsQuery";
import { useAuth } from "@/shared/auth/AuthContext";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useI18n } from "@/shared/i18n/useI18n";
import { Alert, AlertDescription } from "@/shared/ui/alert";

export function ChannelsPage() {
  const { t } = useI18n();
  const { companyId } = useAuth();
  const cid = companyId ?? null;

  const { data, isLoading, isError, error, refetch } = useChannelsQuery(cid);
  const { data: bots = [] } = useChannelBotsQuery(cid);

  const [createOpen, setCreateOpen] = useState(false);
  const [editChannel, setEditChannel] = useState<ChannelModel | null>(null);
  const editOpen = editChannel != null;

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.settings.channels.pageTitle")}
      subtitle={t("modules.settings.routes.channels.description")}
    >
      <div className="flex flex-col gap-6">
        {isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof Error ? error.message : t("modules.settings.channels.loadError")}
            </AlertDescription>
          </Alert>
        ) : null}

        <ChannelMetricsCards summary={data?.summary} />

        <ChannelTableSection
          channels={data?.channels ?? []}
          isLoading={isLoading}
          companyId={cid}
          onAdd={() => setCreateOpen(true)}
          onRefresh={() => void refetch()}
          onEdit={(c) => setEditChannel(c)}
        />

        <CreateChannelSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          companyId={cid}
          bots={bots}
        />

        <EditChannelSheet
          channel={editChannel}
          open={editOpen}
          onOpenChange={(open) => {
            if (!open) setEditChannel(null);
          }}
          companyId={cid}
        />
      </div>
    </DashboardPageLayout>
  );
}
