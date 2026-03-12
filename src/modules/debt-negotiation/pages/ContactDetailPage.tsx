import { useParams, Link } from "react-router-dom";
import { useI18n } from "@/shared/i18n/useI18n";

/** Placeholder para a tela de detalhe do contato. Substituir quando a tela interna estiver pronta. */
export function ContactDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <Link
        to="/debt-negotiation/contacts"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        ← {t("pages.debtNegotiation.contacts.title")}
      </Link>
      <h1 className="text-xl font-semibold text-foreground">
        {t("pages.debtNegotiation.contacts.title")} – {id}
      </h1>
      <p className="text-sm text-muted-foreground">
        Tela de detalhe do contato em construção.
      </p>
    </div>
  );
}
