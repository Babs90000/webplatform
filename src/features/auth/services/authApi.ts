import { api } from "@/lib/api";

export interface ForgotPasswordResponse {
  ok: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  ok: boolean;
  message: string;
}

export const authApi = {
  forgotPassword: (email: string): Promise<ForgotPasswordResponse> =>
    api.post<ForgotPasswordResponse>("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    }),

  resetPassword: (
    accessToken: string,
    password: string,
  ): Promise<ResetPasswordResponse> =>
    api.post<ResetPasswordResponse>("/auth/reset-password", {
      access_token: accessToken,
      password,
    }),
};
