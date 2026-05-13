import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { apiClient } from "../lib/acfmart-api"
import {
  liveStreamService,
  type LiveChatMessage,
  type LiveStreamRealtime,
} from "../lib/firestore-livestream"

export interface LiveStreamSummary {
  id: string
  vendor_id: string
  host_name: string
  host_avatar: string | null
  title: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  status: "scheduled" | "live" | "ended" | "cancelled"
  scheduled_start_at: string
  actual_start_at: string | null
  ended_at: string | null
  hls_url: string | null
  firestore_room_id: string | null
  peak_viewers: number
  total_views: number
}

export function useLiveStreams(status: "live" | "scheduled" | "ended" = "live") {
  return useQuery({
    queryKey: ["live-streams", status],
    queryFn: () =>
      apiClient.get<{ streams: LiveStreamSummary[] }>("/store/live-streams", {
        params: { status },
      }),
  })
}

export function useScheduleLiveStream() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      title: string
      description?: string
      thumbnail_url?: string
      category?: string
      scheduled_start_at: string
    }) =>
      apiClient.post<{ stream: LiveStreamSummary }>(
        "/store/live-streams/schedule",
        input,
        { authRequired: true }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-streams"] }),
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
