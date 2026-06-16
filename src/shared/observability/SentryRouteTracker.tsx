import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { setSentryRoute } from "@/shared/observability/sentry";

export function SentryRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    setSentryRoute(location.pathname);
  }, [location.pathname]);

  return null;
}
