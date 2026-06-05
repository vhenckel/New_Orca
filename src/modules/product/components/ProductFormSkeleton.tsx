import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Skeleton } from "@/shared/ui/skeleton";

export function ProductFormSkeleton() {
  return (
    <DashboardPageLayout showPageHeader={false}>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </DashboardPageLayout>
  );
}
