import type { ProductBrandEntry, ProductDetailData, ProductListItem } from "@/modules/quotation/types";

export const MOCK_PRODUCTS: ProductListItem[] = [
  {
    id: "acucar-cristal-1kg",
    name: "Açúcar Cristal - 1kg",
    unit: "un",
    brands: ["União", "Caravelas"],
    segments: ["Granel", "Açúcares", "Secos", "Padaria"],
  },
  {
    id: "acucar-refinado-1kg",
    name: "Açúcar Refinado - 1kg",
    unit: "kg",
    brands: ["União", "Caravelas", "Da Barra"],
    segments: ["Secos", "Granel", "Açúcares"],
  },
  {
    id: "arroz-tipo-1",
    name: "Arroz Tipo 1",
    unit: "kg",
    brands: ["Tio João", "Camil", "Urbano"],
    segments: ["Secos", "Granel"],
  },
  {
    id: "feijao-carioca",
    name: "Feijão Carioca",
    unit: "kg",
    brands: ["Camil", "Kicaldo"],
    segments: ["Secos", "Granel"],
  },
  {
    id: "oleo-soja",
    name: "Óleo de Soja",
    unit: "un",
    brands: ["Soya", "Liza"],
    segments: ["Secos", "Óleos"],
  },
  {
    id: "file-mignon",
    name: "Filé Mignon",
    unit: "kg",
    brands: ["Friboi", "Minerva"],
    segments: ["Carnes", "Resfriados"],
  },
  {
    id: "frango-inteiro",
    name: "Frango Inteiro",
    unit: "kg",
    brands: ["Sadia", "Perdigão"],
    segments: ["Carnes", "Aves"],
  },
  {
    id: "alface",
    name: "Alface Crespa",
    unit: "un",
    brands: [],
    segments: ["Hortifruti", "Folhas"],
  },
  {
    id: "tomate-italiano",
    name: "Tomate Italiano",
    unit: "kg",
    brands: ["Sítio", "Campo Verde"],
    segments: ["Hortifruti", "Legumes"],
  },
  {
    id: "refrigerante-cola",
    name: "Refrigerante Cola 2L",
    unit: "un",
    brands: ["Coca-Cola", "Pepsi", "Antarctica"],
    segments: ["Bebidas", "Granel", "Secos", "Limpeza"],
  },
  {
    id: "agua-mineral",
    name: "Água Mineral 500ml",
    unit: "un",
    brands: ["Crystal", "Indaiá"],
    segments: ["Bebidas"],
  },
  {
    id: "cerveja-pilsen",
    name: "Cerveja Pilsen 600ml",
    unit: "un",
    brands: ["Brahma", "Skol", "Antarctica"],
    segments: ["Bebidas", "Frios"],
  },
  {
    id: "suco-laranja",
    name: "Suco Integral Laranja 1L",
    unit: "un",
    brands: ["Del Valle", "Natural One"],
    segments: ["Bebidas", "Laticínios"],
  },
  {
    id: "batata-palito",
    name: "Batata Palito 1kg",
    unit: "un",
    brands: ["McCain", "Sadia", "Fritz & Frida"],
    segments: ["Congelados", "Frios"],
  },
];

const byId = new Map(MOCK_PRODUCTS.map((p) => [p.id, p]));

export function getProductById(id: string | undefined): ProductListItem | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

function initialFromName(name: string): string {
  const t = name.trim();
  if (!t || t === "—") return "?";
  const first = t[0]?.toUpperCase() ?? "?";
  const parts = t.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return first;
}

function defaultBrandsFromList(brands: string[]): ProductBrandEntry[] {
  return brands
    .filter((b) => b !== "—")
    .map((name, i) => ({
      id: `b-${i}`,
      name,
      initial: initialFromName(name),
      isActive: true,
    }));
}

function defaultInternalId(id: string): string {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `#${String(1000 + (n % 9000)).padStart(4, "0")}`;
}

const DETAIL_OVERRIDES: Record<string, Partial<Pick<ProductDetailData, "internalId" | "brands">>> = {
  "acucar-cristal-1kg": {
    internalId: "#0023",
    brands: [
      { id: "brand-uniao", name: "União", initial: "U", isActive: true },
      { id: "brand-caravelas", name: "Caravelas", initial: "C", isActive: true },
    ],
  },
};

export function getProductDetail(id: string | undefined): ProductDetailData | undefined {
  const list = getProductById(id);
  if (!list) return undefined;
  const extra = DETAIL_OVERRIDES[list.id];
  return {
    list,
    internalId: extra?.internalId ?? defaultInternalId(list.id),
    brands: extra?.brands ?? defaultBrandsFromList(list.brands),
  };
}
