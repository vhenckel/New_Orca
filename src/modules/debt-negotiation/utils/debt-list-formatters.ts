export function formatDebtAmountString(value: string | null): string {
  if (value == null || value === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** CPF: 000.000.000-00 (11 dígitos). */
export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf || cpf === "0") return "-";
  const d = String(cpf).replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** CNPJ: 00.000.000/0000-00 (14 dígitos). */
export function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj || cnpj === "0") return "-";
  const d = String(cnpj).replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
