import { Skeleton } from "@/shared/ui/skeleton";

export function EstablishmentFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
