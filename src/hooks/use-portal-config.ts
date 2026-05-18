import { useQuery } from "@tanstack/react-query"
import type { AppDomain } from "../lib/domain"
import type { PortalConfig, PortalImageSlot } from "../types/portal-config"
import { getPortalConfig } from "../lib/portal-config-service"

const EMPTY_IMAGES: Record<string, PortalImageSlot> = {}

/**
 * Fetch the portal UI configuration for a given domain.
 * Returns `{ images, isLoading }`.  `images` is always a stable
 * Record so callers can safely do `images["hero_banner"]?.image_url`.
 */
export function usePortalConfig(portal: AppDomain) {
  const query = useQuery<PortalConfig | null>({
    queryKey: ["portalConfig", portal],
    queryFn: () => getPortalConfig(portal),
    staleTime: 5 * 60 * 1000,
  })

  return {
    images: query.data?.images ?? EMPTY_IMAGES,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
