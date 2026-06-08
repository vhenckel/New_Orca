const FIRST_CNPJ_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_CNPJ_DIGIT_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function normalizeCNPJ(value?: string): string {
  if (!value) return "";
  return value.replace(/[^a-zA-Z0-9]+/g, "").toUpperCase();
}

function getCNPJVerificationValue(character: string): number {
  return character.charCodeAt(0) - 48;
}

function calculateCNPJVerificationDigit(value: string, weights: number[]): number {
  const sum = weights.reduce(
    (acc, weight, index) => acc + getCNPJVerificationValue(value[index]) * weight,
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isCNPJValid(value: string): boolean {
  const cnpj = normalizeCNPJ(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const firstDigit = calculateCNPJVerificationDigit(cnpj, FIRST_CNPJ_DIGIT_WEIGHTS);
  if (firstDigit !== Number(cnpj[12])) return false;

  const secondDigit = calculateCNPJVerificationDigit(cnpj, SECOND_CNPJ_DIGIT_WEIGHTS);
  return secondDigit === Number(cnpj[13]);
}

export function formatCNPJ(value?: string): string {
  return normalizeCNPJ(value)
    .slice(0, 14)
    .replace(/^(.{2})(.)/, "$1.$2")
    .replace(/^(.{2})\.(.{3})(.)/, "$1.$2.$3")
    .replace(/^(.{2})\.(.{3})\.(.{3})(.)/, "$1.$2.$3/$4")
    .replace(/^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/, "$1.$2.$3/$4-$5");
}
