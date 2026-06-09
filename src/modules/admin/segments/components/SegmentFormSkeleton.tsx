import { Skeleton } from "@/shared/ui/skeleton";

export function SegmentFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
