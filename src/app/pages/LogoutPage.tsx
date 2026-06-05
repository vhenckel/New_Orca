import { useEffect } from "react";

import { useAuth } from "@/shared/auth/AuthContext";

/** Rota `/logout`: limpa sessão e redireciona para login (somente client-side). */
export function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return null;
}
