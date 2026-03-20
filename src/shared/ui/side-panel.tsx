import * as React from "react";

import { cn } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";

const SidePanel = Sheet;

type SidePanelSize = "sm" | "md" | "lg" | "xl";

const sidePanelSizeClass: Record<SidePanelSize, string> = {
  sm: "max-w-[720px] sm:max-w-[720px]",
  md: "max-w-[720px] sm:max-w-[720px]",
  lg: "max-w-[720px] sm:max-w-[720px]",
  xl: "max-w-[720px] sm:max-w-[720px]",
};

const SidePanelContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  React.ComponentPropsWithoutRef<typeof SheetContent> & { size?: SidePanelSize }
>(({ className, size = "md", ...props }, ref) => (
  <SheetContent
    ref={ref}
    side="right"
    className={cn("flex h-full w-full flex-col bg-background p-0", sidePanelSizeClass[size], className)}
    {...props}
  />
));
SidePanelContent.displayName = "SidePanelContent";

const SidePanelHeader = ({ className, ...props }: React.ComponentProps<typeof SheetHeader>) => (
  <SheetHeader
    className={cn("shrink-0 border-b bg-background px-5 py-4 text-left", className)}
    {...props}
  />
);
const SidePanelTitle = SheetTitle;
const SidePanelDescription = SheetDescription;
const SidePanelFooter = ({ className, ...props }: React.ComponentProps<typeof SheetFooter>) => (
  <SheetFooter
    className={cn(
      "shrink-0 border-t bg-background px-4 py-3 sm:flex-row sm:justify-between sm:gap-2",
      className
    )}
    {...props}
  />
);

const SidePanelBody = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex-1 overflow-y-auto bg-background px-4 py-4", className)} {...props} />
);

export {
  SidePanel,
  SidePanelBody,
  SidePanelContent,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelTitle,
};
