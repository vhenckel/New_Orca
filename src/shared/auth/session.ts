import { isTokenExpired } from "@/shared/auth/jwt";
import { getStoredToken } from "@/shared/auth/token-store";

export function hasValidSessionToken(): boolean {
  const token = getStoredToken();
  if (!token) return false;
  return !isTokenExpired(token);
}
