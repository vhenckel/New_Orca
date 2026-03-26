import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { ContactCampaign } from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

type ContactCampaignsCardProps = {
  campaigns: ContactCampaign[];
  formatDateTime: (iso: string | null | undefined) => string;
  t: (key: string) => string;
};

export function ContactCampaignsCard({
  campaigns,
  formatDateTime,
  t,
}: ContactCampaignsCardProps) {
  return (
    <Card>
      <ContactCardHeader
        title={t("pages.debtNegotiation.contactDetail.campaigns")}
        rightSlot={
          campaigns.length > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-full border border-border/60 px-2 text-[10px] font-medium"
            >
              {campaigns.length}
            </Badge>
          ) : null
        }
      />
      <CardContent className="pt-3">
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">-</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {campaigns.map((campaign) => (
              <li key={campaign.campaignId}>
                {campaign.campaignName}{" "}
                {campaign.lastConversationDate
                  ? formatDateTime(campaign.lastConversationDate)
                  : ""}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
