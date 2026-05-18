import { postBackend } from "./api-base"

export interface ProviderCredentialPayload {
  providerId: string
  providerType: "shipping" | "payment"
  mode: "sandbox" | "live"
  clientId?: string
  token?: string
  checksumKey?: string
}

export interface ProviderCredentialStatus {
  providerId: string
  connected: boolean
  maskedToken?: string
  secretRef?: string
  message?: string
}

export async function saveProviderCredential(
  payload: ProviderCredentialPayload
): Promise<ProviderCredentialStatus> {
  return postBackend<ProviderCredentialStatus>("/admin/integrations/credentials", payload)
}

export async function testProviderConnection(input: {
  providerId: string
  providerType: "shipping" | "payment"
  mode: "sandbox" | "live"
}): Promise<ProviderCredentialStatus> {
  return postBackend<ProviderCredentialStatus>("/admin/integrations/test", input)
}
