import type { ReactNode } from "react";
import { Circle } from "lucide-react";

import { CardHeader, CardTitle } from "@/shared/ui/card";

type ContactCardHeaderProps = {
  title: string;
  rightSlot?: ReactNode;
};

export function ContactCardHeader({ title, rightSlot }: ContactCardHeaderProps) {
  return (
    <CardHeader className="border-b pb-2 pt-3">
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Circle className="size-3.5" />
          {title}
        </CardTitle>
        {rightSlot}
      </div>
    </CardHeader>
  );
}
