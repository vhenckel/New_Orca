import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { NegotiationStatusBadge } from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import type { ContactDebtItem } from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

type ContactDebtsCardProps = {
  debts: ContactDebtItem[] | null | undefined;
  formatDate: (iso: string | null | undefined) => string;
  debtStatusToStageName: (status: string) => string;
  t: (key: string) => string;
};

export function ContactDebtsCard({
  debts,
  formatDate,
  debtStatusToStageName,
  t,
}: ContactDebtsCardProps) {
  return (
    <Card>
      <ContactCardHeader
        title={t("pages.debtNegotiation.contactDetail.debts")}
        rightSlot={
          Array.isArray(debts) && debts.length > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-full border border-border/60 px-2 text-[10px] font-medium"
            >
              {debts.length}
            </Badge>
          ) : null
        }
      />
      <CardContent className="pt-3">
        {!Array.isArray(debts) || debts.length === 0 ? (
          <p className="text-sm text-muted-foreground">-</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {debts.map((debt, index) => (
              <li key={index} className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(debt.totalAmount)}
                </span>
                <div className="flex items-center gap-2">
                  <NegotiationStatusBadge stageName={debtStatusToStageName(debt.status)} />
                </div>
                <span className="text-muted-foreground">
                  {t("pages.debtNegotiation.contactDetail.renegotiationDate")}:{" "}
                  {formatDate(debt.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
