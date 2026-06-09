import { Skeleton } from "@/shared/ui/skeleton";

export function SupplierCompanyListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-full max-w-xs" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}
