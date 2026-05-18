import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc,
  increment,
  limit,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import type { LiveStream, LiveStreamStatus } from "../types"

export interface LiveStreamRealtime {
  id: string
  status: "live" | "ended" | "scheduled"
  viewerCount: number
  peakViewers: number
  currentProductId?: string
  startedAt?: Date
}

function tsToISO(ts: unknown): string | null {
  if (!ts) return null
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  const maybe = ts as { toDate?: () => Date }
  if (typeof maybe.toDate === "function") return maybe.toDate().toISOString()
  try {
    return new Date(ts as string).toISOString()
  } catch {
    return null
  }
}

function snapshotToLiveStream(snap: {
  id: string
  data: () => Record<string, unknown>
}): LiveStream {
  const d = snap.data()
  const scheduled =
    tsToISO(d.scheduled_start_at) ?? new Date().toISOString()
  return {
    id: snap.id,
    vendor_id: String(d.vendor_id ?? ""),
    host_name: String(d.host_name ?? "Shop ACFMart"),
    host_avatar: (d.host_avatar as string | null) ?? null,
    title: String(d.title ?? ""),
    description: (d.description as string | null) ?? null,
    thumbnail_url: (d.thumbnail_url as string | null) ?? null,
    category: (d.category as string | null) ?? null,
    status: ((d.status as LiveStreamStatus) ?? "scheduled") as LiveStreamStatus,
    scheduled_start_at: scheduled,
    actual_start_at: tsToISO(d.actual_start_at),
    ended_at: tsToISO(d.ended_at),
    hls_url: (d.hls_url as string | null) ?? null,
    firestore_room_id: (d.firestore_room_id as string | null) ?? snap.id,
    peak_viewers: Number(d.peak_viewers ?? 0),
    total_views: Number(d.total_views ?? 0),
    verified_origin: Boolean(d.verified_origin ?? false),
  }
}

export interface LiveChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  isHost: boolean
}

function tsToDate(ts: any): Date | undefined {
  if (!ts) return undefined
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts?.toDate) return ts.toDate()
  return new Date(ts)
}

export interface ScheduleStreamInput {
  vendor_id: string
  host_name: string
  host_avatar?: string | null
  title: string
  description?: string | null
  thumbnail_url?: string | null
  category?: string | null
  scheduled_start_at: Date
}

export interface UpdateStreamMetaInput {
  title?: string
  description?: string | null
  thumbnail_url?: string | null
  category?: string | null
  scheduled_start_at?: Date
}

export const liveStreamService = {
  subscribeStream(streamId: string, onChange: (d: LiveStreamRealtime | null) => void): Unsubscribe {
    return onSnapshot(doc(firestore, "streams", streamId), (snap) => {
      if (!snap.exists()) return onChange(null)
      const data = snap.data()
      onChange({
        id: snap.id,
        status: data.status,
        viewerCount: data.viewerCount ?? 0,
        peakViewers: data.peakViewers ?? 0,
        currentProductId: data.currentProductId,
        startedAt: tsToDate(data.startedAt),
      })
    })
  },

  subscribeChat(streamId: string, onChange: (m: LiveChatMessage[]) => void): Unsubscribe {
    const q = query(
      collection(firestore, "streams", streamId, "chat"),
      orderBy("timestamp", "desc"),
      limit(100)
    )
    return onSnapshot(q, (snap) => {
      onChange(
        snap.docs
          .map((d) => {
            const data = d.data()
            return {
              id: d.id,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              content: data.content,
              timestamp: tsToDate(data.timestamp) ?? new Date(),
              isHost: data.isHost ?? false,
            }
          })
          .reverse()
      )
    })
  },

  async sendChat(input: {
    streamId: string
    senderId: string
    senderName: string
    senderAvatar?: string
    content: string
    isHost?: boolean
  }): Promise<void> {
    await addDoc(collection(firestore, "streams", input.streamId, "chat"), {
      senderId: input.senderId,
      senderName: input.senderName,
      senderAvatar: input.senderAvatar ?? null,
      content: input.content,
      isHost: input.isHost ?? false,
      timestamp: serverTimestamp(),
    })
  },

  async joinStream(streamId: string, userId: string): Promise<void> {
    await setDoc(doc(firestore, "streams", streamId, "viewers", userId), {
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    })
    await updateDoc(doc(firestore, "streams", streamId), { viewerCount: increment(1) })
  },

  async leaveStream(streamId: string, userId: string): Promise<void> {
    await deleteDoc(doc(firestore, "streams", streamId, "viewers", userId))
    await updateDoc(doc(firestore, "streams", streamId), { viewerCount: increment(-1) })
  },

  async pinProduct(streamId: string, productId: string): Promise<void> {
    await updateDoc(doc(firestore, "streams", streamId), { currentProductId: productId })
  },

  async startStream(streamId: string): Promise<void> {
    await setDoc(
      doc(firestore, "streams", streamId),
      { status: "live", viewerCount: 0, peakViewers: 0, startedAt: serverTimestamp() },
      { merge: true }
    )
  },

  async endStream(streamId: string): Promise<void> {
    await updateDoc(doc(firestore, "streams", streamId), {
      status: "ended",
      endedAt: serverTimestamp(),
    })
  },

  /**
   * subscribeStreams — realtime list of streams filtered by status. Used by the
   * buyer `/live` listing and the seller `/seller/live` portal. Caller owns
   * the unsubscribe.
   */
  subscribeStreams(
    status: LiveStreamStatus,
    onChange: (streams: LiveStream[]) => void
  ): Unsubscribe {
    const q = query(
      collection(firestore, "streams"),
      where("status", "==", status),
      orderBy("scheduled_start_at", "desc"),
      limit(50)
    )
    return onSnapshot(q, (snap) => {
      onChange(snap.docs.map((d) => snapshotToLiveStream(d)))
    })
  },

  /**
   * subscribeStreamsForVendor — realtime list scoped to a single seller, used
   * in the seller portal. No status filter; UI tabs over the result.
   */
  subscribeStreamsForVendor(
    vendorId: string,
    onChange: (streams: LiveStream[]) => void
  ): Unsubscribe {
    const q = query(
      collection(firestore, "streams"),
      where("vendor_id", "==", vendorId),
      orderBy("scheduled_start_at", "desc"),
      limit(100)
    )
    return onSnapshot(q, (snap) => {
      onChange(snap.docs.map((d) => snapshotToLiveStream(d)))
    })
  },

  async getStream(streamId: string): Promise<LiveStream | null> {
    const snap = await getDoc(doc(firestore, "streams", streamId))
    if (!snap.exists()) return null
    return snapshotToLiveStream(snap)
  },

  async listStreamsByStatus(status: LiveStreamStatus): Promise<LiveStream[]> {
    const q = query(
      collection(firestore, "streams"),
      where("status", "==", status),
      orderBy("scheduled_start_at", "desc"),
      limit(50)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapshotToLiveStream(d))
  },

  /**
   * scheduleStream — seller-side create. Writes only client-safe fields to the
   * Firestore doc. RTMPS credentials are populated server-side by the
   * `createLiveInput` Cloud Function. Stream lands in `scheduled` status.
   */
  async scheduleStream(input: ScheduleStreamInput): Promise<string> {
    const ref = await addDoc(collection(firestore, "streams"), {
      vendor_id: input.vendor_id,
      host_name: input.host_name,
      host_avatar: input.host_avatar ?? null,
      title: input.title,
      description: input.description ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      category: input.category ?? null,
      status: "scheduled" as LiveStreamStatus,
      scheduled_start_at: Timestamp.fromDate(input.scheduled_start_at),
      actual_start_at: null,
      ended_at: null,
      hls_url: null,
      firestore_room_id: null,
      peak_viewers: 0,
      total_views: 0,
      verified_origin: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    await updateDoc(ref, { firestore_room_id: ref.id })
    return ref.id
  },

  /**
   * updateStreamMeta — seller edits a scheduled or live stream's display info.
   * Whitelist of fields enforced both here and in firestore.rules.
   */
  async updateStreamMeta(
    streamId: string,
    patch: UpdateStreamMetaInput
  ): Promise<void> {
    const update: Record<string, unknown> = {
      updated_at: serverTimestamp(),
    }
    if (patch.title !== undefined) update.title = patch.title
    if (patch.description !== undefined) update.description = patch.description
    if (patch.thumbnail_url !== undefined) update.thumbnail_url = patch.thumbnail_url
    if (patch.category !== undefined) update.category = patch.category
    if (patch.scheduled_start_at !== undefined) {
      update.scheduled_start_at = Timestamp.fromDate(patch.scheduled_start_at)
    }
    await updateDoc(doc(firestore, "streams", streamId), update)
  },
}
