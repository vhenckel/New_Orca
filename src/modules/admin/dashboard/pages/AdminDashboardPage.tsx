import { AdminDashboardHeader } from "@/modules/admin/dashboard/components/AdminDashboardHeader";
import { AdminKpiSection } from "@/modules/admin/dashboard/components/AdminKpiSection";
import { BaseGrowthChart } from "@/modules/admin/dashboard/components/BaseGrowthChart";
import { BillingForecastCard } from "@/modules/admin/dashboard/components/BillingForecastCard";
import { MrrEvolutionChart } from "@/modules/admin/dashboard/components/MrrEvolutionChart";
import { OperationalAlertsSection } from "@/modules/admin/dashboard/components/OperationalAlertsSection";
import { QuotationActivityChart } from "@/modules/admin/dashboard/components/QuotationActivityChart";
import { RecentRegistrationsCard } from "@/modules/admin/dashboard/components/RecentRegistrationsCard";
import { RestaurantStatusChart } from "@/modules/admin/dashboard/components/RestaurantStatusChart";
import { TopCitiesChart } from "@/modules/admin/dashboard/components/TopCitiesChart";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";

export function AdminDashboardPage() {
  return (
    <DashboardPageLayout headerContent={<AdminDashboardHeader />}>
      <AdminKpiSection />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MrrEvolutionChart />
        <BillingForecastCard />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BaseGrowthChart />
        <QuotationActivityChart />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RestaurantStatusChart />
        <TopCitiesChart />
        <RecentRegistrationsCard />
      </section>

      <OperationalAlertsSection />
    </DashboardPageLayout>
  );
}
