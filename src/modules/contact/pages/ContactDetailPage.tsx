import { Link, useParams } from "react-router-dom";
import { useState, useCallback, useMemo, type MouseEvent } from "react";
import {
  Award,
  Ban,
  Bot,
  ChevronDown,
  Clock,
  Copy,
  DollarSign,
  FileText,
  Globe,
  MapPin,
  Megaphone,
  MessageCircle,
  Pencil,
  Send,
  User,
} from "lucide-react";
import { formatCpf } from "@/shared/lib/format";
import { formatContactOriginLabel } from "@/modules/contact/utils/format-contact-origin";
import { formatWhatsApp } from "@/modules/contact/utils/format-whatsapp";
import { useI18n } from "@/shared/i18n/useI18n";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
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
import { PermissionGuard } from "@/shared/auth/PermissionGuard";
import { ConversationHistoryDialog } from "@/modules/debt-negotiation/components/ConversationHistoryDialog";
import { NegotiationStatusBadge } from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import type { ContactDetails, ContactActivity } from "@/modules/contact/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { copyTextToClipboard } from "@/shared/lib/copy-to-clipboard";
import { cn } from "@/shared/lib/utils";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";

const CONTACT_BLOCKLIST_PATH = "/contacts/blocklist";

/** Query `contactsBlQ` na blocklist (dígitos do appkey, mesmo critério da listagem). */
function blocklistFilteredHref(appkey: string | null | undefined): string {
  const digits = String(appkey ?? "").replace(/\D/g, "");
  if (!digits) return CONTACT_BLOCKLIST_PATH;
  return `${CONTACT_BLOCKLIST_PATH}?${new URLSearchParams({ contactsBlQ: digits }).toString()}`;
}

type ActivityFilter = "all" | "campaigns" | "collection" | "bot";

function getActivityFilter(activity: ContactActivity): ActivityFilter {
  const name = (activity.eventName ?? "").toLowerCase();
  if (name.includes("campanha")) return "campaigns";
  if (name.includes("cobrança")) return "collection";
  if (name.includes("bot") || name.includes("conversa")) return "bot";
  return "all";
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
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");

  const activities = activitiesData?.data ?? [];
  const activitiesTotal = activitiesData?.total ?? 0;
  const dealsCount = Array.isArray(details?.deals) ? details.deals.length : 0;
  const campaigns = campaignsData?.campaigns ?? [];

  const name = details?.name ?? "-";
  const addressLine = details ? formatAddress(details) : "";
  const linkedContacts = personCluster?.contacts ?? [];
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
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-base">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {detailsPending ? "…" : name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {details?.lastPipelineStage && (
                    <NegotiationStatusBadge
                      stageName={details.lastPipelineStage}
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {t("pages.debtNegotiation.contactDetail.lifecycleStage")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PermissionGuard
                permissionNames={["editar"]}
                moduleName="contatos"
                subModuleName="contatos"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      aria-label="Editar"
                      onClick={() => setEditContactOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Editar</TooltipContent>
                </Tooltip>
              </PermissionGuard>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Enviar</TooltipContent>
              </Tooltip>
              <PermissionGuard
                permissionNames={["mover_para_blocklist"]}
                moduleName="contatos"
                subModuleName="contatos"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setAddToBlocklistOpen(true)}
                    >
                      <Ban className="h-4 w-4" />
                      {t("pages.contact.addToBlocklist.button")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {t("pages.contact.addToBlocklist.button")}
                  </TooltipContent>
                </Tooltip>
              </PermissionGuard>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setConversationOpen(true)}>
                    <MessageCircle className="h-4 w-4" />

                    {t("pages.debtNegotiation.contactDetail.viewConversation")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {t("pages.debtNegotiation.contactDetail.viewConversation")}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {details?.email && (
              <span className="flex items-center gap-1">
                {details.email}
                <CopyButton value={details.email} />
              </span>
            )}
            {mainContactForHeader?.appkey ? (
              <span className="flex items-center gap-2 font-medium text-foreground">
                {mainContactForHeader.isInBlackList ? (
                  <PermissionGuard
                    permissionNames={[
                      "mover_para_blocklist",
                      "retirar_da_blocklist",
                    ]}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={blocklistFilteredHref(
                            mainContactForHeader.appkey,
                          )}
                          className="inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-destructive hover:bg-muted"
                          aria-label={t(
                            "pages.debtNegotiation.contactDetail.blocklist",
                          )}
                        >
                          <Ban className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        {t("pages.debtNegotiation.contactDetail.blocklist")}
                      </TooltipContent>
                    </Tooltip>
                  </PermissionGuard>
                ) : null}
                {formatWhatsApp(mainContactForHeader.appkey)}
                <CopyButton value={mainContactForHeader.appkey} />
              </span>
            ) : linkedContacts.length === 0 && details?.phone ? (
              <span className="flex items-center gap-1">
                {details.phone}
                <CopyButton value={details.phone} />
              </span>
            ) : null}
            {details?.cpf && (
              <span className="flex items-center gap-1 font-mono">
                {formatCpf(details.cpf)}
                <CopyButton value={details.cpf} />
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span>
              {t("pages.debtNegotiation.contactDetail.firstConversation")}:{" "}
              {formatDateTime(metrics?.dateFirstConversation ?? null)}
            </span>
            <span>
              {t("pages.debtNegotiation.contactDetail.lastConversation")}:{" "}
              {formatDateTime(metrics?.dateLastConversation ?? null)}
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: Detalhes do Contato + Atividades */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.detailsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Informações Gerais */}
              <Collapsible
                defaultOpen
                className="group border-b last:border-b-0"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {t("pages.debtNegotiation.contactDetail.generalInfo")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
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
                        {details?.ownerUserName ??
                          details?.createdByUser ??
                          "-"}
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
                      <dd>
                        {formatContactOriginLabel(details?.origin) || "-"}
                      </dd>
                    </div>
                  </dl>
                </CollapsibleContent>
              </Collapsible>

              {/* WhatsApp(s) — principal no topo da lista */}
              <Collapsible
                defaultOpen
                className="group border-b last:border-b-0"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    {t("pages.debtNegotiation.contactDetail.whatsapps")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {sortedLinkedContacts.length > 0 ? (
                    <div className="flex flex-col gap-2 pb-4">
                      {sortedLinkedContacts.map((c, idx) => (
                        <div
                          key={`${c.id}-${idx}`}
                          className="flex items-center gap-2"
                        >
                          {c.isInBlackList ? (
                            <PermissionGuard
                              permissionNames={[
                                "mover_para_blocklist",
                                "retirar_da_blocklist",
                              ]}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    to={blocklistFilteredHref(c.appkey)}
                                    className="inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-destructive hover:bg-muted"
                                    aria-label={t(
                                      "pages.debtNegotiation.contactDetail.blocklist",
                                    )}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-xs"
                                >
                                  {t(
                                    "pages.debtNegotiation.contactDetail.blocklist",
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </PermissionGuard>
                          ) : null}
                          <span className="text-sm font-medium text-foreground">
                            {formatWhatsApp(c.appkey ?? "")}
                            {c.main
                              ? ` (${t("pages.debtNegotiation.contactDetail.mainContact")})`
                              : ""}
                          </span>
                          {c.appkey ? <CopyButton value={c.appkey} /> : null}
                        </div>
                      ))}
                    </div>
                  ) : details?.phone ? (
                    <p className="flex items-center gap-1 pb-4 text-sm text-muted-foreground">
                      <span>{details.phone}</span>
                      <CopyButton value={details.phone} />
                    </p>
                  ) : (
                    <p className="pb-4 text-sm text-muted-foreground">-</p>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Pix */}
              <Collapsible className="group border-b last:border-b-0">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {t("pages.debtNegotiation.contactDetail.pix")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="pb-4 text-sm text-muted-foreground">
                    {t("pages.debtNegotiation.contactDetail.pixEmpty")}
                  </p>
                </CollapsibleContent>
              </Collapsible>

              {/* Qualificação do contato */}
              <Collapsible className="group border-b last:border-b-0">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    {t("pages.debtNegotiation.contactDetail.qualification")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
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

              {/* Endereço */}
              <Collapsible className="group border-b last:border-b-0">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {t("pages.debtNegotiation.contactDetail.address")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="pb-4 text-sm text-muted-foreground">
                    {addressLine ||
                      t("pages.debtNegotiation.contactDetail.addressEmpty")}
                  </p>
                </CollapsibleContent>
              </Collapsible>

              {/* Lista de registros */}
              <Collapsible className="group border-b last:border-b-0">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:opacity-80">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {t("pages.debtNegotiation.contactDetail.recordList")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="pb-4 text-sm text-muted-foreground">
                    {details?.contactListName ?? "-"}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card>
            <Tabs
              value={activityFilter}
              onValueChange={(v) => setActivityFilter(v as ActivityFilter)}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {t("pages.debtNegotiation.contactDetail.activities")} (
                    {activitiesTotal})
                  </CardTitle>
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="px-2 text-xs sm:px-3">
                      {t(
                        "pages.debtNegotiation.contactDetail.activitiesFilterAll",
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="campaigns"
                      className="px-2 text-xs sm:px-3"
                    >
                      {t(
                        "pages.debtNegotiation.contactDetail.activitiesFilterCampaigns",
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="collection"
                      className="px-2 text-xs sm:px-3"
                    >
                      {t(
                        "pages.debtNegotiation.contactDetail.activitiesFilterCollection",
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="bot" className="px-2 text-xs sm:px-3">
                      {t(
                        "pages.debtNegotiation.contactDetail.activitiesFilterBot",
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {(["all", "campaigns", "collection", "bot"] as const).map(
                  (tab) => {
                    const list =
                      tab === "all"
                        ? activities
                        : activities.filter(
                            (a) => getActivityFilter(a) === tab,
                          );
                    return (
                      <TabsContent key={tab} value={tab} className="mt-0">
                        {list.length === 0 ? (
                          <p className="py-4 text-sm text-muted-foreground">
                            -
                          </p>
                        ) : (
                          <ul className="divide-y">
                            {list.map((activity, i) => {
                              const filter = getActivityFilter(activity);
                              const Icon =
                                filter === "campaigns"
                                  ? Megaphone
                                  : filter === "collection"
                                    ? Clock
                                    : filter === "bot"
                                      ? Bot
                                      : FileText;
                              return (
                                <li
                                  key={`${activity.eventDate}-${i}`}
                                  className="flex items-start gap-3 py-3 first:pt-0"
                                >
                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                      filter === "campaigns" &&
                                        "bg-primary/15 text-primary",
                                      filter === "collection" &&
                                        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                                      filter === "bot" &&
                                        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                                      filter === "all" &&
                                        "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                                    <p className="text-sm text-foreground">
                                      {activity.eventName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDateTime(activity.eventDate)}
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </TabsContent>
                    );
                  },
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Coluna direita: Compliance, Métricas, Dívidas */}
        <div className="flex flex-col gap-6">
          {/* Compliance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.compliance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">NPS</dt>
                  <dd>-</dd>
                </div>
                {details?.optin?.map((o) => (
                  <div
                    key={o.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <dt className="text-muted-foreground">{o.label}</dt>
                    <dd className="flex items-center gap-1">
                      {o.validated ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
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

          {/* Métricas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.metrics")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
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

          {/* Dívidas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.debts")}
                {Array.isArray(debts) && debts.length > 0
                  ? ` (${debts.length})`
                  : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!Array.isArray(debts) || debts.length === 0 ? (
                <p className="text-sm text-muted-foreground">-</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {debts.map((debt, i) => (
                    <li key={i} className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(debt.totalAmount)}
                      </span>
                      <div className="flex items-center gap-2">
                        <NegotiationStatusBadge
                          stageName={debtStatusToStageName(debt.status)}
                        />
                      </div>
                      <span className="text-muted-foreground">
                        {t(
                          "pages.debtNegotiation.contactDetail.renegotiationDate",
                        )}
                        : {formatDate(debt.updatedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Negócios */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.deals")}
                {dealsCount > 0 ? ` (${dealsCount})` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {dealsCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("pages.debtNegotiation.contactDetail.dealsEmpty")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </CardContent>
          </Card>

          {/* Campanhas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.campaigns")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">-</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {campaigns.map((c) => (
                    <li key={c.campaignId}>
                      {c.campaignName}{" "}
                      {c.lastConversationDate
                        ? formatDateTime(c.lastConversationDate)
                        : ""}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Origem */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("pages.debtNegotiation.contactDetail.origin")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {formatContactOriginLabel(details?.origin) ||
                  t("pages.debtNegotiation.contactDetail.originEmpty")}
              </p>
            </CardContent>
          </Card>
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
