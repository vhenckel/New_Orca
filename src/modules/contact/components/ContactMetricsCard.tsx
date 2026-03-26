import { Card, CardContent } from "@/shared/ui/card";
import type { ContactMetricsResponse } from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

type ContactMetricsCardProps = {
  metrics: ContactMetricsResponse | null | undefined;
  t: (key: string) => string;
};

export function ContactMetricsCard({ metrics, t }: ContactMetricsCardProps) {
  return (
    <Card>
      <ContactCardHeader title={t("pages.debtNegotiation.contactDetail.metrics")} />
      <CardContent className="pt-3">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {t("pages.debtNegotiation.contactDetail.conversations")}
            </dt>
            <dd>{metrics?.metrics.conversations ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {t("pages.debtNegotiation.contactDetail.simulations")}
            </dt>
            <dd>{metrics?.metrics.simulations ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {t("pages.debtNegotiation.contactDetail.humanServices")}
            </dt>
            <dd>{metrics?.metrics.services ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {t("pages.debtNegotiation.contactDetail.contracts")}
            </dt>
            <dd>{metrics?.metrics.contracts ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {t("pages.debtNegotiation.contactDetail.products")}
            </dt>
            <dd>{metrics?.metrics.products ?? 0}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
