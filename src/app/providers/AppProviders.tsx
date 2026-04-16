import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

import { I18nProvider } from "@/shared/i18n/I18nProvider";
import { AccentColorProvider } from "@/shared/theme/AccentColorProvider";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { Toaster } from "@/shared/ui/toaster";
import { TooltipProvider } from "@/shared/ui/tooltip";

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="orca-theme"
      >
        <AccentColorProvider>
          <I18nProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </I18nProvider>
        </AccentColorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
