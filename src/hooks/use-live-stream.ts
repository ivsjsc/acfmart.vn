import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "../lib/firebase"
import {
  liveStreamService,
  type LiveChatMessage,
  type LiveStreamRealtime,
  type ScheduleStreamInput,
  type UpdateStreamMetaInput,
} from "../lib/firestore-livestream"
import type { LiveStream, LiveStreamStatus } from "../types"
import { useAuthStore } from "../stores/auth-store"

/**
 * LiveStreamSummary — preserved for backwards compatibility with the existing
 * `/live` and `/live/:id` screens that consumed `useLiveStreams("live").data.streams`.
 * Maps 1:1 onto `LiveStream` from `src/types.ts`.
 */
export type LiveStreamSummary = LiveStream

/**
 * useLiveStreams — Firestore-first realtime list. Subscribes to the `streams`
 * collection filtered by status, mirrors the result into React Query cache so
 * downstream components see the familiar `{ streams: [] }` shape.
 */
export function useLiveStreams(status: LiveStreamStatus = "live") {
  const qc = useQueryClient()
  const queryKey = ["live-streams", status] as const
  const result = useQuery({
    queryKey,
    queryFn: () =>
      liveStreamService
        .listStreamsByStatus(status)
        .then((streams) => ({ streams })),
    staleTime: 30_000,
  })

  useEffect(() => {
    const unsub = liveStreamService.subscribeStreams(status, (streams) => {
      qc.setQueryData(queryKey, { streams })
    })
    return unsub
    // queryKey is stable per status, qc identity is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return result
}

/**
 * useStreamsForVendor — seller portal: realtime list of own streams.
 */
export function useStreamsForVendor(vendorId: string | null | undefined) {
  const qc = useQueryClient()
  const queryKey = ["vendor-live-streams", vendorId ?? "anonymous"] as const

  const result = useQuery({
    queryKey,
    queryFn: () => Promise.resolve({ streams: [] as LiveStream[] }),
    enabled: !!vendorId,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!vendorId) return
    const unsub = liveStreamService.subscribeStreamsForVendor(
      vendorId,
      (streams) => {
        qc.setQueryData(queryKey, { streams })
      }
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId])

  return result
}

/**
 * useLiveStream — single stream by id, one-shot fetch.
 */
export function useLiveStream(streamId: string | null | undefined) {
  return useQuery({
    queryKey: ["live-stream", streamId],
    queryFn: () =>
      streamId ? liveStreamService.getStream(streamId) : Promise.resolve(null),
    enabled: !!streamId,
    staleTime: 10_000,
  })
}

/**
 * useScheduleLiveStream — create a scheduled stream + allocate Cloudflare live
 * input in one mutation. If the Cloudflare callable fails (e.g. secrets not yet
 * configured), the Firestore doc stays around in `scheduled` status without
 * RTMPS creds; the seller can retry via the Studio screen.
 */
export function useScheduleLiveStream() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (input: {
      title: string
      description?: string
      thumbnail_url?: string
      category?: string
      scheduled_start_at: string
    }) => {
      if (!user?.id) throw new Error("Bạn cần đăng nhập")
      const scheduleInput: ScheduleStreamInput = {
        vendor_id: user.id,
        host_name: user.name ?? "Shop ACFMart",
        host_avatar: user.avatar ?? null,
        title: input.title,
        description: input.description ?? null,
        thumbnail_url: input.thumbnail_url ?? null,
        category: input.category ?? null,
        scheduled_start_at: new Date(input.scheduled_start_at),
      }
      const streamId = await liveStreamService.scheduleStream(scheduleInput)
      let credentialsError: string | null = null
      try {
        const create = httpsCallable<
          { streamId: string },
          { rtmpsUrl: string; streamKey: string; playbackUid: string }
        >(functions, "createLiveInput")
        await create({ streamId })
      } catch (err) {
        credentialsError =
          err instanceof Error
            ? err.message
            : "Không khởi tạo được luồng phát. Vui lòng thử lại sau."
        // Note: this string is consumed by SellerLiveFormScreen which already
        // wraps it in a sanitize-friendly toast; keep the raw text for the
        // dev console while the form re-presents a friendly version.
      }
      return { streamId, credentialsError }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["live-streams"] })
      void qc.invalidateQueries({ queryKey: ["vendor-live-streams"] })
    },
  })
}

export function useUpdateStreamMeta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { streamId: string; patch: UpdateStreamMetaInput }) => {
      await liveStreamService.updateStreamMeta(input.streamId, input.patch)
      return input.streamId
    },
    onSuccess: (streamId) => {
      void qc.invalidateQueries({ queryKey: ["live-stream", streamId] })
      void qc.invalidateQueries({ queryKey: ["live-streams"] })
      void qc.invalidateQueries({ queryKey: ["vendor-live-streams"] })
    },
  })
}

export function useEndLiveStream() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (streamId: string) => {
      const fn = httpsCallable<{ streamId: string }, { ok: boolean }>(
        functions,
        "endLiveStream"
      )
      await fn({ streamId })
      return streamId
    },
    onSuccess: (streamId) => {
      void qc.invalidateQueries({ queryKey: ["live-stream", streamId] })
      void qc.invalidateQueries({ queryKey: ["live-streams"] })
      void qc.invalidateQueries({ queryKey: ["vendor-live-streams"] })
    },
  })
}

export interface PlaybackTokenResponse {
  manifestUrl: string
  expiresAt: number
  playbackUid: string
}

/**
 * useSignedPlayback — buyer-side: fetch a signed HLS manifest URL with a 10
 * minute TTL. Re-issues automatically after 8 minutes so the `<video>` element
 * doesn't 401 mid-watch. Returns null while loading or on failure (UI shows a
 * fallback message).
 */
export function useSignedPlayback(streamId: string | null | undefined) {
  return useQuery({
    queryKey: ["playback-token", streamId],
    queryFn: async (): Promise<PlaybackTokenResponse> => {
      if (!streamId) throw new Error("Missing streamId")
      const fn = httpsCallable<{ streamId: string }, PlaybackTokenResponse>(
        functions,
        "signPlaybackToken"
      )
      const res = await fn({ streamId })
      return res.data
    },
    enabled: !!streamId,
    staleTime: 8 * 60_000,
    refetchInterval: 8 * 60_000,
    retry: false,
  })
}

export interface StreamCredentialsResponse {
  rtmpsUrl: string
  streamKey: string
  playbackUid: string
}

/**
 * useStreamCredentials — seller-only: fetch RTMPS URL + stream key on demand
 * (not stored in client-readable Firestore fields). Manual-trigger only;
 * don't auto-refetch to avoid leaking keys.
 */
export function useStreamCredentials() {
  return useMutation({
    mutationFn: async (streamId: string): Promise<StreamCredentialsResponse> => {
      const fn = httpsCallable<{ streamId: string }, StreamCredentialsResponse>(
        functions,
        "getStreamCredentials"
      )
      const res = await fn({ streamId })
      return res.data
    },
  })
}

export function useLiveStreamRealtime(streamId: string | null) {
  const [data, setData] = useState<LiveStreamRealtime | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!streamId) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = liveStreamService.subscribeStream(streamId, (next) => {
      setData(next)
      setLoading(false)
    })
    return unsub
  }, [streamId])

  return { data, loading }
}

export function useLiveStreamChat(streamId: string | null) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  useEffect(() => {
    if (!streamId) return
    const unsub = liveStreamService.subscribeChat(streamId, setMessages)
    return unsub
  }, [streamId])
  return messages
}
