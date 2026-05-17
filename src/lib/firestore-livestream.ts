import {
  collection,
  deleteDoc,
  doc,
  query,
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

export interface LiveStreamRealtime {
  id: string
  status: "live" | "ended" | "scheduled"
  viewerCount: number
  peakViewers: number
  currentProductId?: string
  startedAt?: Date
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
}
