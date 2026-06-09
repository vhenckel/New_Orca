import { Skeleton } from "@/shared/ui/skeleton";

export function SupplierCompanyFormSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full md:col-span-2" />
      <Skeleton className="h-10 w-full md:col-span-2" />
      <Skeleton className="h-6 w-48 md:col-span-2" />
    </div>
  );
}
