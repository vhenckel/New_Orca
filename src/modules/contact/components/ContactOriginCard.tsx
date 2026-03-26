import { Card, CardContent } from "@/shared/ui/card";
import type { ContactDetails } from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

type ContactOriginCardProps = {
  origin: ContactDetails["origin"];
  formatContactOriginLabel: (origin: ContactDetails["origin"]) => string;
  t: (key: string) => string;
};

export function ContactOriginCard({
  origin,
  formatContactOriginLabel,
  t,
}: ContactOriginCardProps) {
  return (
    <Card>
      <ContactCardHeader title={t("pages.debtNegotiation.contactDetail.origin")} />
      <CardContent className="pt-3">
        <p className="text-sm text-muted-foreground">
          {formatContactOriginLabel(origin) ||
            t("pages.debtNegotiation.contactDetail.originEmpty")}
        </p>
      </CardContent>
    </Card>
  );
}
