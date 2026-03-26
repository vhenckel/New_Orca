import { Card, CardContent } from "@/shared/ui/card";
import type { ContactDetails } from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

type ContactComplianceCardProps = {
  details: ContactDetails | null | undefined;
  t: (key: string) => string;
};

export function ContactComplianceCard({ details, t }: ContactComplianceCardProps) {
  return (
    <Card>
      <ContactCardHeader title={t("pages.debtNegotiation.contactDetail.compliance")} />
      <CardContent className="pt-3">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">NPS</dt>
            <dd>-</dd>
          </div>
          {details?.optin?.map((optin) => (
            <div key={optin.label} className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">{optin.label}</dt>
              <dd className="flex items-center gap-1">
                {optin.validated ? (
                  <>
                    <span className="size-1.5 rounded-full bg-green-500" />
                    {t("pages.debtNegotiation.contactDetail.validated")}
                  </>
                ) : (
                  "-"
                )}
              </dd>
            </div>
          ))}
          {(!details?.optin || details.optin.length === 0) && (
            <dd className="text-muted-foreground">-</dd>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
