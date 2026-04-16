import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function AnalyticsPage() {
  return (
    <DashboardPageLayout
      showPageHeader
      title="Analises"
      subtitle="Acompanhe tendencias de gastos e economia"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Grafico de gastos mensais sera conectado com os dados reais nas proximas etapas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Economia acumulada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualizacao de economia acumulada do periodo selecionado.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
