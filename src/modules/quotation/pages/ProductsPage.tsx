import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const products = [
  "Picanha",
  "Acucar Refinado 1kg",
  "Batata 10mm Congelada",
  "Cerveja Pilsen 600ml",
  "Azeite Dende 900ml",
];

export function ProductsPage() {
  return (
    <DashboardPageLayout showPageHeader title="Produtos" subtitle="Gerencie seu catalogo de produtos">
      <Card>
        <CardHeader>
          <CardTitle>Lista de produtos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {products.map((product) => (
            <div key={product} className="rounded-lg border border-border px-4 py-3 text-sm text-foreground">
              {product}
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
