import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/authToken";

export type BillingSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export interface BillingStatusResponse {
  provider: string;
  min_commitment_months: number;
  trial_days: number;
  subscription: {
    plan: string;
    status: BillingSubscriptionStatus;
    current_period_end: string | null;
    commitment_ends_at: string | null;
    early_commitment_at: string | null;
    domain_eligible: boolean;
    can_early_commit: boolean;
    can_cancel: boolean;
    has_customer: boolean;
  } | null;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface ExportEstimateResponse {
  export_id: string;
  complexity: string;
  price_eur: number;
  price_display: string;
  breakdown: {
    pages: number;
    blocks: number;
    custom_blocks: number;
    has_form: boolean;
    has_gallery: boolean;
  };
}

export interface ExportStatusResponse {
  export: {
    id: string;
    status: "pending" | "processing" | "ready" | "expired" | "error";
    complexity: string | null;
    price_eur: number;
    public_url: string | null;
    expires_at: string | null;
    created_at: string;
  };
}

const token = (): string | undefined => getAuthToken() ?? undefined;

export const billingApi = {
  getStatus: (): Promise<BillingStatusResponse> =>
    api.get<BillingStatusResponse>("/billing/status", token()),

  createSubscriptionCheckout: (): Promise<CheckoutResponse> =>
    api.post<CheckoutResponse>("/billing/checkout", {}, token()),

  createCustomerPortal: (): Promise<{ portal_url: string }> =>
    api.post<{ portal_url: string }>("/billing/portal", {}, token()),

  applyEarlyCommitment: (): Promise<BillingStatusResponse> =>
    api.post<BillingStatusResponse>("/billing/early-commitment", {}, token()),

  estimateExport: (projectId: string): Promise<ExportEstimateResponse> =>
    api.post<ExportEstimateResponse>(
      `/projects/${projectId}/exports/estimate`,
      {},
      token(),
    ),

  createExportCheckout: (
    projectId: string,
    exportId: string,
  ): Promise<CheckoutResponse> =>
    api.post<CheckoutResponse>(
      `/projects/${projectId}/exports/${exportId}/checkout`,
      {},
      token(),
    ),

  getExportStatus: (exportId: string): Promise<ExportStatusResponse> =>
    api.get<ExportStatusResponse>(`/exports/${exportId}`, token()),
};

/** Redirection vers Checkout / Portail (PSP-agnostique côté front) */
export const redirectToPaymentUrl = (url: string): void => {
  window.location.assign(url);
};
