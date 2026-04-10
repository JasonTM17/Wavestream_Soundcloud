import type {
  AuthSessionDto,
  LoginRequest,
  RegisterRequest,
} from "@wavestream/shared";

import { apiRequest } from "@/lib/api";
import { clearSession, setAuthenticatedSession } from "@/lib/auth-session";

export type AuthSession = AuthSessionDto;

export type SignInInput = LoginRequest;

export type SignUpInput = RegisterRequest;

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type LogoutResult = {
  loggedOut: true;
};

export async function signIn(input: SignInInput) {
  const session = await apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: input,
    auth: "none",
  });

  setAuthenticatedSession(session);
  return session;
}

export async function signUp(input: SignUpInput) {
  const session = await apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body: input,
    auth: "none",
  });

  setAuthenticatedSession(session);
  return session;
}

export async function forgotPassword(input: ForgotPasswordInput) {
  return apiRequest<{ sent: true }>("/api/auth/forgot-password", {
    method: "POST",
    body: input,
  });
}

export async function resetPassword(input: ResetPasswordInput) {
  return apiRequest<{ reset: true }>("/api/auth/reset-password", {
    method: "POST",
    body: input,
  });
}

export async function signOut() {
  try {
    return await apiRequest<LogoutResult>("/api/auth/logout", {
      method: "POST",
      auth: "none",
    });
  } finally {
    clearSession();
  }
}
