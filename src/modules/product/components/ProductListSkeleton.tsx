import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export function ProductListSkeleton() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="mb-2 h-5 w-2/3" />
            <Skeleton className="mb-3 h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 7 }).map((_, i) => (
              <TableHead key={i} className={i === 0 ? "w-16" : undefined} />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 7 }).map((_, cell) => (
                <TableCell key={cell}>
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
