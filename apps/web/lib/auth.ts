import type {
  AuthSessionDto,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from "@wavestream/shared";

import { apiRequest } from "@/lib/api";

export type AuthSession = AuthSessionDto;

export type SignInInput = LoginRequest;

export type SignUpInput = RegisterRequest & {
  role: UserRole.LISTENER | UserRole.CREATOR;
};

export async function signIn(input: SignInInput) {
  return apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

export async function signUp(input: SignUpInput) {
  return apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body: input,
  });
}
