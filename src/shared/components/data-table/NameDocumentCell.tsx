import { Link } from "react-router-dom";

import { formatCnpj, formatCpf } from "@/shared/lib/format";

type NameDocumentCellProps = {
  name: string | null | undefined;
  href?: string;
  onClick?: () => void;
  cpf?: string | null;
  cnpj?: string | null;
};

function resolveDocument(cpf?: string | null, cnpj?: string | null): string {
  if (cnpj && cnpj !== "0") return `CNPJ ${formatCnpj(cnpj)}`;
  if (cpf && cpf !== "0") return `CPF ${formatCpf(cpf)}`;
  return "-";
}

export function NameDocumentCell({
  name,
  href,
  onClick,
  cpf,
  cnpj,
}: NameDocumentCellProps) {
  const label = (name ?? "-").trim() || "-";
  const document = resolveDocument(cpf, cnpj);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {href ? (
        <Link
          to={href}
          className="break-words font-medium text-primary underline-offset-4 hover:underline"
        >
          {label}
        </Link>
      ) : (
        <button
          type="button"
          className="break-words text-left font-medium text-primary underline-offset-4 hover:underline"
          onClick={onClick}
        >
          {label}
        </button>
      )}
      <span className="text-xs text-muted-foreground">{document}</span>
    </div>
  );
}
