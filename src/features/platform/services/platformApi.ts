import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/authToken";

export interface TenantQuota {
  sites_limit: number;
  sites_count: number;
  plan: string;
  can_create_site: boolean;
}

export interface PlatformQuotaResponse {
  quota: TenantQuota;
  llm_tokens_month: number;
}

export interface DomainVerifyResponse {
  ok: boolean;
  domain: string;
  expected_cname: string;
  records: string[];
  instructions: string[];
  error?: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string | null;
  revoked_at?: string | null;
}

export interface ApiKeysListResponse {
  keys: ApiKeyRecord[];
  warning?: string;
}

export interface ApiKeyCreateResponse {
  key: Pick<ApiKeyRecord, "id" | "name" | "key_prefix" | "created_at">;
  secret: string;
  warning: string;
}

const token = (): string | undefined => getAuthToken() ?? undefined;

export const platformApi = {
  getQuota: (): Promise<PlatformQuotaResponse> =>
    api.get<PlatformQuotaResponse>("/platform/quota", token()),

  verifyDomain: (
    domain: string,
    expectedCname?: string,
  ): Promise<DomainVerifyResponse> =>
    api.post<DomainVerifyResponse>(
      "/platform/domains/verify",
      {
        domain: domain.trim().toLowerCase(),
        ...(expectedCname ? { expected_cname: expectedCname } : {}),
      },
      token(),
    ),

  listApiKeys: (): Promise<ApiKeysListResponse> =>
    api.get<ApiKeysListResponse>("/platform/api-keys", token()),

  createApiKey: (name?: string): Promise<ApiKeyCreateResponse> =>
    api.post<ApiKeyCreateResponse>(
      "/platform/api-keys",
      { name: name?.trim() || "Clé API" },
      token(),
    ),

  revokeApiKey: (keyId: string): Promise<{ ok: boolean }> =>
    api.delete<{ ok: boolean }>(`/platform/api-keys/${keyId}`, token()),

  listCms: (
    projectId: string,
  ): Promise<{ entries: Array<Record<string, unknown>> }> =>
    api.get(`/platform/cms/${projectId}`, token()),

  upsertCms: (
    projectId: string,
    payload: { slug: string; title?: string; body?: Record<string, unknown> },
  ): Promise<{ entry: Record<string, unknown> }> =>
    api.put(`/platform/cms/${projectId}`, payload, token()),

  listProducts: (
    projectId: string,
  ): Promise<{ products: Array<Record<string, unknown>> }> =>
    api.get(`/platform/commerce/${projectId}/products`, token()),

  createProduct: (
    projectId: string,
    payload: {
      name: string;
      price_cents: number;
      currency?: string;
      stripe_price_id?: string;
      description?: string;
    },
  ): Promise<{ product: Record<string, unknown> }> =>
    api.post(`/platform/commerce/${projectId}/products`, payload, token()),
};
