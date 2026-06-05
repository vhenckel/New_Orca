import { apiRequest } from "@/shared/api/http-client";
import type {
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/shared/auth/types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    },
    skipAuth: true,
  });
}

export type ForgotPasswordMethod = "email" | "whatsapp";

export async function forgotPassword(
  identifier: string,
  method: ForgotPasswordMethod = "whatsapp",
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: {
      identifier: identifier.trim().toLowerCase(),
      method,
    },
    skipAuth: true,
  });
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}
