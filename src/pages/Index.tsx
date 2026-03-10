import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { KPICard } from "@/components/dashboard/KPICard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { DonutCard } from "@/components/dashboard/DonutCard";
import { NegotiationFunnel } from "@/components/dashboard/NegotiationFunnel";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIStatusWidget } from "@/components/dashboard/AIStatusWidget";
import { DailyTable } from "@/components/dashboard/DailyTable";
import { cn } from "@/lib/utils";

const debtAgeData = [
  { name: "Até 90 dias", value: 70, color: "hsl(239, 84%, 67%)" },
  { name: "91 a 365 dias", value: 21, color: "hsl(239, 84%, 80%)" },
  { name: "Mais de 365 dias", value: 9, color: "hsl(239, 60%, 90%)" },
];

const debtValueData = [
  { name: "Até 2 mil", value: 60, color: "hsl(239, 84%, 67%)" },
  { name: "2 mil a 5 mil", value: 22, color: "hsl(239, 84%, 80%)" },
  { name: "5 mil a 10 mil", value: 17, color: "hsl(239, 60%, 90%)" },
  { name: "Maior que 10 mil", value: 1, color: "hsl(239, 40%, 95%)" },
];

const debtorAgeData = [
  { name: "31 a 40 anos", value: 33, color: "hsl(239, 84%, 67%)" },
  { name: "41 a 50 anos", value: 35, color: "hsl(239, 84%, 80%)" },
  { name: "51 a 60 anos", value: 15, color: "hsl(239, 60%, 90%)" },
  { name: "Outros", value: 17, color: "hsl(239, 40%, 95%)" },
];

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-60"
        )}
      >
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] space-y-6 p-6">
            {/* AI Status */}
            <AIStatusWidget />

            {/* Section 1 — Key Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                label="Total de Dívidas"
                value="R$ 1.266.819"
                change="+12.3% vs mês anterior"
                trend="up"
                percentage="100%"
                delay={0}
              />
              <KPICard
                label="Total Negociado"
                value="R$ 128.141"
                change="+10.12%"
                trend="up"
                percentage="10,12%"
                delay={50}
              />
              <KPICard
                label="Total Recuperado"
                value="R$ 21.503"
                change="+16.78%"
                trend="up"
                percentage="16,78%"
                delay={100}
              />
              <KPICard
                label="Taxa de Recuperação"
                value="1,70%"
                change="+0.3pp"
                trend="up"
                delay={150}
              />
            </div>

            {/* Section 2 — Operational Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard label="Total de Devedores" value="381" subtitle="100% da base" delay={200} />
              <MetricCard label="Negociações Ativas" value="47" subtitle="12,34% do total" delay={250} />
              <MetricCard label="Acordos Fechados" value="14" subtitle="29,79% das negociações" delay={300} />
              <MetricCard label="Taxa de Conversão" value="3,67%" subtitle="Recuperação efetiva" delay={350} />
            </div>

            {/* Section 3 — Chart + Funnel */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>
              <NegotiationFunnel />
            </div>

            {/* Section 4 — Portfolio Analysis */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DonutCard title="Idade da Dívida" data={debtAgeData} delay={400} />
              <DonutCard title="Valor da Dívida" data={debtValueData} delay={450} />
              <DonutCard title="Faixa Etária dos Devedores" data={debtorAgeData} delay={500} />
            </div>

            {/* Section 5 — Activity Feed + Table */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DailyTable />
              </div>
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
