import { getLandingPathForPersona, mapApiUserToMeResponse } from "@/shared/auth/api-user";
import { isTokenExpired } from "@/shared/auth/jwt";
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
} from "@/shared/auth/token-store";
import { Button } from "@/shared/ui/button";

function getHomePath(): string {
  const token = getStoredToken();
  const apiUser = getStoredUser();

  if (token && apiUser?.active && !isTokenExpired(token)) {
    const sessionUser = mapApiUserToMeResponse(apiUser);
    return getLandingPathForPersona(sessionUser.persona);
  }

  return "/login";
}

export function SentryErrorFallback() {
  const token = getStoredToken();
  const hasValidSession = token ? !isTokenExpired(token) : false;

  const handleGoHome = () => {
    window.location.href = getHomePath();
  };

  const handleLogout = () => {
    clearStoredSession();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
          Erro
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Algo deu errado. Tente voltar para a página inicial ou entre em
          contato com o suporte.
        </p>
        <div className="mt-6 grid grid-cols-2 items-center justify-center gap-3">
          <Button type="button" onClick={handleGoHome}>
            Voltar para a home
          </Button>
          {hasValidSession && (
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
