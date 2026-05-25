import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  setDoc,
  getDoc,
  limit,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: Date
  read: boolean
  attachments?: Array<{ type: "image" | "file"; url: string; name?: string }>
}

export type ConversationContextType = "product" | "order" | "general"

export interface Conversation {
  id: string
  type: "shop" | "support" | "aivy"
  participants: string[]
  partyId: string
  partyName: string
  partyAvatar?: string
  lastMessage: string
  lastMessageAt: Date | null
  unreadCount: number
  contextType?: ConversationContextType
  contextId?: string
}

function tsToDate(ts: any): Date {
  if (!ts) return new Date()
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts.toDate) return ts.toDate()
  return new Date(ts)
}

export const chatService = {
  async getOrCreateConversation(input: {
    userId: string
    userName?: string
    userAvatar?: string
    partyId: string
    type: "shop" | "support"
    partyName: string
    partyAvatar?: string
    contextType?: ConversationContextType
    contextId?: string
  }): Promise<string> {
    const participants = [input.userId, input.partyId].sort()
    const contextSuffix = input.contextType && input.contextId
      ? `_${input.contextType}_${input.contextId}`
      : ""
    const conversationId = `${input.type}_${participants[0]}_${participants[1]}${contextSuffix}`
    const ref = doc(firestore, "conversations", conversationId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        type: input.type,
        participants,
        partyName: input.partyName,
        partyAvatar: input.partyAvatar ?? null,
        participantProfiles: {
          [input.userId]: {
            name: input.userName || "Khách hàng",
            avatar: input.userAvatar ?? null,
          },
          [input.partyId]: {
            name: input.partyName,
            avatar: input.partyAvatar ?? null,
          },
        },
        lastMessage: "",
        lastMessageAt: null,
        unreadCount: { [input.userId]: 0, [input.partyId]: 0 },
        contextType: input.contextType ?? "general",
        contextId: input.contextId ?? null,
        createdAt: serverTimestamp(),
      })
    }
    return conversationId
  },

  subscribeConversations(
    userId: string,
    onChange: (conversations: Conversation[]) => void,
    options?: { type?: Conversation["type"]; contextType?: ConversationContextType; contextId?: string }
  ): Unsubscribe {
    const q = query(
      collection(firestore, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc"),
      limit(50)
    )
    return onSnapshot(q, (snap) => {
      onChange(
        snap.docs
          .map((d) => {
            const data = d.data()
            const participants = Array.isArray(data.participants)
              ? data.participants.filter((id: unknown): id is string => typeof id === "string")
              : []
            const partyId = participants.find((id) => id !== userId) ?? ""
            const profile = partyId ? data.participantProfiles?.[partyId] : null
            return {
              id: d.id,
              type: data.type,
              participants,
              partyId,
              partyName: profile?.name ?? data.partyName,
              partyAvatar: profile?.avatar ?? data.partyAvatar,
              lastMessage: data.lastMessage ?? "",
              lastMessageAt: data.lastMessageAt ? tsToDate(data.lastMessageAt) : null,
              unreadCount: data.unreadCount?.[userId] ?? 0,
              contextType: data.contextType ?? undefined,
              contextId: data.contextId ?? undefined,
            }
          })
          .filter((conversation) => {
            if (options?.type && conversation.type !== options.type) return false
            if (options?.contextType && conversation.contextType !== options.contextType) return false
            if (options?.contextId && conversation.contextId !== options.contextId) return false
            return true
          })
      )
    })
  },

  subscribeMessages(
    conversationId: string,
    onChange: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    const q = query(
      collection(firestore, "conversations", conversationId, "messages"),
      orderBy("timestamp", "asc"),
      limit(200)
    )
    return onSnapshot(q, (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            senderId: data.senderId,
            content: data.content,
            timestamp: tsToDate(data.timestamp),
            read: data.read ?? false,
            attachments: data.attachments ?? undefined,
          }
        })
      )
    })
  },

  async sendMessage(input: {
    conversationId: string
    senderId: string
    receiverId: string
    content: string
    attachments?: ChatMessage["attachments"]
  }): Promise<string> {
    const messagesRef = collection(
      firestore,
      "conversations",
      input.conversationId,
      "messages"
    )
    const msgDoc = await addDoc(messagesRef, {
      senderId: input.senderId,
      content: input.content,
      timestamp: serverTimestamp(),
      read: false,
      attachments: input.attachments ?? null,
    })

    const convRef = doc(firestore, "conversations", input.conversationId)
    const snap = await getDoc(convRef)
    const currentUnread = snap.data()?.unreadCount ?? {}
    await updateDoc(convRef, {
      lastMessage: input.content.slice(0, 100),
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${input.receiverId}`]: (currentUnread[input.receiverId] ?? 0) + 1,
    })

    return msgDoc.id
  },

  async markRead(conversationId: string, userId: string): Promise<void> {
    await updateDoc(doc(firestore, "conversations", conversationId), {
      [`unreadCount.${userId}`]: 0,
    })
  },
}
