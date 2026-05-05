import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useAuth } from "@/shared/auth/AuthContext";

/**
 * Sincroniza rotas fornecedor desktop (`/supplier/...`) com mobile (`/m/supplier/...`)
 * conforme a viewport. Comprador em `/m/` é redirecionado (RouteGuard reforça).
 */
export function MobileRedirectGuard() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const { pathname, search } = location;

    if (user.persona === "buyer" && pathname.startsWith("/m/")) {
      navigate(`/dashboard${search}`, { replace: true });
      return;
    }

    if (user.persona !== "supplier") return;

    if (isMobile) {
      if (pathname.startsWith("/m/supplier")) {
        return;
      }
      if (pathname.startsWith("/supplier/quotations")) {
        const target = pathname.replace("/supplier/quotations", "/m/supplier/quotations");
        navigate(`${target}${search}`, { replace: true });
        return;
      }
      if (pathname.startsWith("/supplier")) {
        navigate(`/m/supplier/quotations${search}`, { replace: true });
        return;
      }
      return;
    }

    if (pathname.startsWith("/m/supplier/quotations")) {
      const target = pathname.replace("/m/supplier/quotations", "/supplier/quotations");
      navigate(`${target}${search}`, { replace: true });
    }
  }, [isMobile, user, loading, location.pathname, location.search, navigate]);

  return null;
}
