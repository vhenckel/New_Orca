import { Link, useParams } from "react-router-dom";
import { useState, useCallback, useMemo, type MouseEvent } from "react";
import { Copy } from "lucide-react";
import { formatCpf } from "@/shared/lib/format";
import { formatContactOriginLabel } from "@/modules/contact/utils/format-contact-origin";
import { formatWhatsApp } from "@/modules/contact/utils/format-whatsapp";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { AddToBlocklistDialog } from "@/modules/contact/components/AddToBlocklistDialog";
import { EditContactDrawer } from "@/modules/contact/components/EditContactDrawer";
import {
  useContactDetails,
  useContactMetrics,
  useContactDebts,
  useContactActivities,
  useContactCampaigns,
  usePersonContactCluster,
} from "@/modules/contact/hooks";
import type { PersonContactListItem } from "@/modules/contact/types/person-contact";
import { ConversationHistoryDialog } from "@/modules/debt-negotiation/components/ConversationHistoryDialog";
import type { ContactDetails, ContactCampaign } from "@/modules/contact/types";
import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ContactDetailHeader } from "@/modules/contact/components/ContactDetailHeader";
import { ContactDetailsInfoCard } from "@/modules/contact/components/ContactDetailsInfoCard";
import { ContactActivitiesCard } from "@/modules/contact/components/ContactActivitiesCard";
import { ContactComplianceCard } from "@/modules/contact/components/ContactComplianceCard";
import { ContactMetricsCard } from "@/modules/contact/components/ContactMetricsCard";
import { ContactDebtsCard } from "@/modules/contact/components/ContactDebtsCard";
import { ContactCampaignsCard } from "@/modules/contact/components/ContactCampaignsCard";
import { ContactOriginCard } from "@/modules/contact/components/ContactOriginCard";
import { ContactCardHeader } from "@/modules/contact/components/ContactCardHeader";

const CONTACT_BLOCKLIST_PATH = "/contacts/blocklist";

/** Query `contactsBlQ` na blocklist (dígitos do appkey, mesmo critério da listagem). */
function blocklistFilteredHref(appkey: string | null | undefined): string {
  const digits = String(appkey ?? "").replace(/\D/g, "");
  if (!digits) return CONTACT_BLOCKLIST_PATH;
  return `${CONTACT_BLOCKLIST_PATH}?${new URLSearchParams({ contactsBlQ: digits }).toString()}`;
}

function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "-";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Mapeia status da API de dívidas para o nome de estágio usado pelo badge. */
function debtStatusToStageName(apiStatus: string): string {
  const map: Record<string, string> = {
    NEGOTIATED_WITHOUT_PAYMENT: "negociado sem pagamento",
    IN_COLLECTION: "em cobrança",
  };
  return map[apiStatus] ?? apiStatus.toLowerCase();
}

function formatAddress(d: ContactDetails): string {
  const parts = [
    d.addressStreet,
    d.addressNumber,
    d.addressNeighborhood,
    d.addressCity,
    d.addressState,
    d.addressZipcode,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
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
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

export function ContactDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const contactId = id != null ? parseInt(id, 10) : NaN;
  const validId =
    Number.isInteger(contactId) && contactId > 0 ? contactId : null;

  const { data: details, isPending: detailsPending } =
    useContactDetails(validId);
  const { data: personCluster } = usePersonContactCluster(validId);
  const { data: metrics } = useContactMetrics(validId);
  const { data: debts } = useContactDebts(validId);
  const { data: activitiesData } = useContactActivities(validId, 1);
  const { data: campaignsData } = useContactCampaigns(validId);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [addToBlocklistOpen, setAddToBlocklistOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);

  const activities = activitiesData?.data ?? [];
  const activitiesTotal = activitiesData?.total ?? 0;
  const dealsCount = Array.isArray(details?.deals) ? details.deals.length : 0;
  const campaigns = campaignsData?.campaigns ?? [];

  const name = details?.name ?? "-";
  const addressLine = details ? formatAddress(details) : "";
  const linkedContacts = useMemo(
    () => personCluster?.contacts ?? [],
    [personCluster?.contacts],
  );
  /** Principal primeiro, depois demais por id. */
  const sortedLinkedContacts = useMemo(() => {
    if (linkedContacts.length === 0) return [];
    return [...linkedContacts].sort((a, b) => {
      if (a.main !== b.main) return a.main ? -1 : 1;
      return a.id - b.id;
    });
  }, [linkedContacts]);

  /** WhatsApp principal da pessoa (header ao lado do e-mail). */
  const mainContactForHeader = useMemo(() => {
    if (sortedLinkedContacts.length === 0) return null;
    return sortedLinkedContacts.find((c) => c.main) ?? sortedLinkedContacts[0];
  }, [sortedLinkedContacts]);
  const headerPhoneRaw = mainContactForHeader?.appkey ?? details?.phone ?? null;
  const headerPhoneDisplay = headerPhoneRaw ? formatWhatsApp(headerPhoneRaw) : null;
  const headerPhoneInBlackList = Boolean(mainContactForHeader?.isInBlackList);
  const headerPhoneBlocklistHref =
    mainContactForHeader?.appkey && mainContactForHeader.isInBlackList
      ? blocklistFilteredHref(mainContactForHeader.appkey)
      : null;
  const headerDocumentRaw = details?.cpf ?? null;
  const headerDocumentDisplay = details?.cpf ? formatCpf(details.cpf) : null;

  /** Candidatos ao modal de blocklist: cluster da pessoa ou contato único (fallback). */
  const blocklistCandidates = useMemo((): PersonContactListItem[] => {
    if (sortedLinkedContacts.length > 0) return sortedLinkedContacts;
    if (details && validId != null) {
      return [
        {
          id: validId,
          name: details.name,
          appkey: details.phone ?? null,
          main: true,
          isInBlackList: false,
        },
      ];
    }
    return [];
  }, [sortedLinkedContacts, details, validId]);

  if (id == null || !validId) {
    return (
      <DashboardPageLayout
        showPageHeader
        title={t("pages.debtNegotiation.contactDetail.detailsTitle")}
        subtitle={t("pages.debtNegotiation.contactDetail.detailsDescription")}
      >
        <p className="text-sm text-muted-foreground">ID de contato inválido.</p>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("pages.debtNegotiation.contactDetail.detailsTitle")}
      subtitle={t("pages.debtNegotiation.contactDetail.detailsDescription")}
    >
      <ContactDetailHeader
        isPending={detailsPending}
        name={name}
        initials={getInitials(name)}
        lastPipelineStage={details?.lastPipelineStage}
        email={details?.email}
        phoneDisplay={headerPhoneDisplay}
        phoneRaw={headerPhoneRaw}
        phoneInBlackList={headerPhoneInBlackList}
        phoneBlocklistHref={headerPhoneBlocklistHref}
        documentDisplay={headerDocumentDisplay}
        documentRaw={headerDocumentRaw}
        firstConversationDate={formatDateTime(metrics?.dateFirstConversation ?? null)}
        lastConversationDate={formatDateTime(metrics?.dateLastConversation ?? null)}
        texts={{
          addToBlocklist: t("pages.contact.addToBlocklist.button"),
          blocklist: t("pages.debtNegotiation.contactDetail.blocklist"),
          viewConversation: t("pages.debtNegotiation.contactDetail.viewConversation"),
          firstConversation: t("pages.debtNegotiation.contactDetail.firstConversation"),
          lastConversation: t("pages.debtNegotiation.contactDetail.lastConversation"),
          emailLabel: "E-mail",
          phoneLabel: "Telefone",
          documentLabel: "CPF / CNPJ",
          edit: "Editar",
          send: "Enviar",
        }}
        onOpenEdit={() => setEditContactOpen(true)}
        onAddToBlocklist={() => setAddToBlocklistOpen(true)}
        onOpenConversation={() => setConversationOpen(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ContactDetailsInfoCard
            details={details}
            sortedLinkedContacts={sortedLinkedContacts}
            addressLine={addressLine}
            formatDate={formatDate}
            formatWhatsApp={formatWhatsApp}
            formatContactOriginLabel={formatContactOriginLabel}
            blocklistFilteredHref={blocklistFilteredHref}
            t={t}
          />
          <ContactActivitiesCard
            activities={activities}
            activitiesTotal={activitiesTotal}
            formatDateTime={formatDateTime}
            t={t}
          />
        </div>

        <div className="flex flex-col gap-6">
          <ContactComplianceCard details={details} t={t} />
          <ContactMetricsCard metrics={metrics} t={t} />
          <ContactDebtsCard
            debts={debts}
            formatDate={formatDate}
            debtStatusToStageName={debtStatusToStageName}
            t={t}
          />

          <Card>
            <ContactCardHeader
              title={t("pages.debtNegotiation.contactDetail.deals")}
              rightSlot={
                dealsCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="h-5 rounded-full border border-border/60 px-2 text-[10px] font-medium"
                  >
                    {dealsCount}
                  </Badge>
                ) : null
              }
            />
            <CardContent className="pt-3">
              {dealsCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("pages.debtNegotiation.contactDetail.dealsEmpty")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </CardContent>
          </Card>

          <ContactCampaignsCard
            campaigns={campaigns as ContactCampaign[]}
            formatDateTime={formatDateTime}
            t={t}
          />
          <ContactOriginCard
            origin={details?.origin}
            formatContactOriginLabel={formatContactOriginLabel}
            t={t}
          />
        </div>
      </div>

      <AddToBlocklistDialog
        open={addToBlocklistOpen}
        onOpenChange={setAddToBlocklistOpen}
        anchorContactId={validId}
        candidates={blocklistCandidates}
      />

      {validId != null ? (
        <EditContactDrawer
          open={editContactOpen}
          onOpenChange={setEditContactOpen}
          contactId={validId}
          linkedContacts={sortedLinkedContacts}
          fallbackPhone={details?.phone ?? null}
        />
      ) : null}

      <ConversationHistoryDialog
        contactId={validId}
        contactName={details?.name ?? undefined}
        open={conversationOpen}
        onOpenChange={setConversationOpen}
      />
    </DashboardPageLayout>
  );
}
