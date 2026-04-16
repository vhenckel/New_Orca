import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const suppliers = [
  "Distribuidora Central",
  "Alimentos Premium",
  "Hortifruti Express",
  "Bebidas & Cia",
  "Frigorifico ABC",
];

export function SuppliersPage() {
  return (
    <DashboardPageLayout
      showPageHeader
      title="Fornecedores"
      subtitle="Acompanhe e avalie seus fornecedores"
    >
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores ativos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {suppliers.map((supplier) => (
            <div key={supplier} className="rounded-lg border border-border px-4 py-3 text-sm text-foreground">
              {supplier}
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
