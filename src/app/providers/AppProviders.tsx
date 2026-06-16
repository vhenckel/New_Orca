import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

import { queryClient } from "@/app/providers/query-client";
import { I18nProvider } from "@/shared/i18n/I18nProvider";
import { SentryErrorFallback } from "@/shared/observability/SentryErrorFallback";
import { Sentry } from "@/shared/observability/sentry";
import { AccentColorProvider } from "@/shared/theme/AccentColorProvider";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { Toaster } from "@/shared/ui/toaster";
import { TooltipProvider } from "@/shared/ui/tooltip";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
    </Sentry.ErrorBoundary>
  );
}
