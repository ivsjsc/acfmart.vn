import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { firestore } from "../../lib/firebase"
import { AIVY_WELCOME_MESSAGE } from "./system-prompt"
import type { AivyMessage } from "./types"

export const AIVY_MODEL_HISTORY_LIMIT = 10
export const AIVY_REMOTE_HISTORY_LIMIT = 10
export const AIVY_LOCAL_HISTORY_LIMIT = 80

type StoredAivyMessage = Pick<AivyMessage, "id" | "role" | "content" | "timestamp">

function localHistoryKey(userId: string) {
  return `acfmart-aivy-history:${userId}`
}

function isPersistableMessage(message: AivyMessage): boolean {
  return (
    (message.role === "user" || message.role === "assistant") &&
    !!message.content.trim() &&
    !message.error &&
    !message.isStreaming &&
    message.content !== AIVY_WELCOME_MESSAGE
  )
}

function normalizeStoredMessage(value: unknown): AivyMessage | null {
  if (!value || typeof value !== "object") return null
  const item = value as Partial<StoredAivyMessage>
  if (item.role !== "user" && item.role !== "assistant") return null
  if (typeof item.content !== "string" || !item.content.trim()) return null
  return {
    id: typeof item.id === "string" ? item.id : `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: item.role,
    content: item.content.slice(0, 4000),
    timestamp: typeof item.timestamp === "number" ? item.timestamp : Date.now(),
  }
}

function compactMessages(messages: AivyMessage[], limit: number): StoredAivyMessage[] {
  return messages
    .filter(isPersistableMessage)
    .slice(-limit)
    .map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content.slice(0, 4000),
      timestamp: message.timestamp,
    }))
}

export function createAivyWelcomeMessage(): AivyMessage {
  return {
    id: `msg_${Date.now()}_welcome`,
    role: "assistant",
    content: AIVY_WELCOME_MESSAGE,
    timestamp: Date.now(),
  }
}

export function withAivyWelcome(messages: AivyMessage[]): AivyMessage[] {
  const persisted = messages.filter(isPersistableMessage)
  return [createAivyWelcomeMessage(), ...persisted]
}

export function readLocalAivyHistory(userId: string): AivyMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(localHistoryKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeStoredMessage)
      .filter((message): message is AivyMessage => !!message)
      .slice(-AIVY_LOCAL_HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function writeLocalAivyHistory(userId: string, messages: AivyMessage[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      localHistoryKey(userId),
      JSON.stringify(compactMessages(messages, AIVY_LOCAL_HISTORY_LIMIT))
    )
  } catch {
    // localStorage can be full or disabled; Firestore mirror still works.
  }
}

export function clearLocalAivyHistory(userId: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(localHistoryKey(userId))
  } catch {
    // Ignore local cleanup errors.
  }
}

function historyDoc(userId: string) {
  return doc(firestore, "users", userId, "aivyHistory", "current")
}

export async function loadRemoteAivyHistory(userId: string): Promise<AivyMessage[]> {
  const snap = await getDoc(historyDoc(userId))
  if (!snap.exists()) return []
  const messages = snap.data().messages
  if (!Array.isArray(messages)) return []
  return messages
    .map(normalizeStoredMessage)
    .filter((message): message is AivyMessage => !!message)
    .slice(-AIVY_REMOTE_HISTORY_LIMIT)
}

export async function saveRemoteAivyHistory(
  userId: string,
  messages: AivyMessage[]
): Promise<void> {
  await setDoc(
    historyDoc(userId),
    {
      user_id: userId,
      messages: compactMessages(messages, AIVY_REMOTE_HISTORY_LIMIT),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function clearRemoteAivyHistory(userId: string): Promise<void> {
  await deleteDoc(historyDoc(userId))
}
