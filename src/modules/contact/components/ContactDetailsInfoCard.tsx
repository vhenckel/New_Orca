import { useCallback, useState, type MouseEvent } from "react";
import {
  Award,
  ChevronDown,
  Copy,
  DollarSign,
  Globe,
  MapPin,
  MessageCircle,
  Smartphone,
  User,
} from "lucide-react";

import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import type {
  ContactDetails,
  PersonContactListItem,
} from "@/modules/contact/types";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";
import { ContactWhatsAppLine } from "@/modules/contact/components/ContactWhatsAppLine";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const text = String(value ?? "").trim();
      if (!text) return;
      const ok = await copyTextToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [value],
  );

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      title={copied ? "Copiado" : "Copiar"}
    >
      <Copy className="size-3.5" />
    </button>
  );
}

type ContactDetailsInfoCardProps = {
  details: ContactDetails | null | undefined;
  sortedLinkedContacts: PersonContactListItem[];
  addressLine: string;
  formatDate: (iso: string | null | undefined) => string;
  formatWhatsApp: (phone: string) => string;
  formatContactOriginLabel: (origin: ContactDetails["origin"]) => string;
  blocklistFilteredHref: (appkey: string | null | undefined) => string;
  t: (key: string) => string;
};

export function ContactDetailsInfoCard({
  details,
  sortedLinkedContacts,
  addressLine,
  formatDate,
  formatWhatsApp,
  formatContactOriginLabel,
  blocklistFilteredHref,
  t,
}: ContactDetailsInfoCardProps) {
  return (
    <Card>
      <ContactCardHeader
        title={t("pages.debtNegotiation.contactDetail.detailsTitle")}
      />
      <CardContent className="pt-3">
        <Collapsible defaultOpen className="group border-b last:border-b-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
            <span className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              {t("pages.debtNegotiation.contactDetail.generalInfo")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <dl className="grid grid-cols-1 gap-2 pb-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">ID</dt>
                <dd>{details?.id ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t("pages.debtNegotiation.contactDetail.contactOwner")}
                </dt>
                <dd>
                  {details?.ownerUserName ?? details?.createdByUser ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Persona</dt>
                <dd>{details?.persona ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t("pages.debtNegotiation.contactDetail.contactOrigin")}
                </dt>
                <dd>{formatContactOriginLabel(details?.origin) || "-"}</dd>
              </div>
            </dl>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen className="group border-b last:border-b-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
            <span className="flex items-center gap-2">
              <MessageCircle className="size-4 text-muted-foreground" />
              {t("pages.debtNegotiation.contactDetail.whatsapps")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {sortedLinkedContacts.length > 0 ? (
              <div className="flex flex-col gap-2 pb-4">
                {sortedLinkedContacts.map((contact, idx) => (
                  <ContactWhatsAppLine
                    key={`${contact.id}-${idx}`}
                    appkey={contact.appkey}
                    isInBlackList={Boolean(contact.isInBlackList)}
                    main={Boolean(contact.main)}
                    blocklistFilteredHref={blocklistFilteredHref}
                    formatWhatsApp={formatWhatsApp}
                    blocklistTitle={t(
                      "pages.debtNegotiation.contactDetail.blocklist",
                    )}
                    mainContactLabel={t(
                      "pages.debtNegotiation.contactDetail.mainContact",
                    )}
                  />
                ))}
              </div>
            ) : details?.phone ? (
              <p className="flex items-center gap-2 pb-4 text-sm">
                <span className="text-muted-foreground">
                  <Smartphone className="size-4" />
                </span>
                <span className="font-medium text-foreground">
                  {formatWhatsApp(details.phone)}
                </span>
                <CopyButton value={details.phone} />
              </p>
            ) : (
              <p className="pb-4 text-sm text-muted-foreground">-</p>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="group border-b last:border-b-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
            <span className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              {t("pages.debtNegotiation.contactDetail.pix")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="pb-4 text-sm text-muted-foreground">
              {t("pages.debtNegotiation.contactDetail.pixEmpty")}
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="group border-b last:border-b-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
            <span className="flex items-center gap-2">
              <Award className="size-4 text-muted-foreground" />
              {t("pages.debtNegotiation.contactDetail.qualification")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <dl className="grid grid-cols-1 gap-2 pb-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.birthDate",
                  )}
                </dt>
                <dd>{formatDate(details?.birthDate ?? null)}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.gender",
                  )}
                </dt>
                <dd>{details?.genre ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.maritalStatus",
                  )}
                </dt>
                <dd>{details?.maritalStatus ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.schooling",
                  )}
                </dt>
                <dd>{details?.schooling ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.profession",
                  )}
                </dt>
                <dd>{details?.profession ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.professionalSituation",
                  )}
                </dt>
                <dd>{details?.professionalSituation ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.companyGroup",
                  )}
                </dt>
                <dd>-</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t(
                    "pages.debtNegotiation.contactDetail.qualification.income",
                  )}
                </dt>
                <dd>
                  {details?.income != null
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(details.income)
                    : "-"}
                </dd>
              </div>
            </dl>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="group border-b last:border-b-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              {t("pages.debtNegotiation.contactDetail.address")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="pb-4 text-sm text-muted-foreground">
              {addressLine ||
                t("pages.debtNegotiation.contactDetail.addressEmpty")}
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="group border-b last:border-b-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
            <span className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              {t("pages.debtNegotiation.contactDetail.recordList")}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="pb-4 text-sm text-muted-foreground">
              {details?.contactListName ?? "-"}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
