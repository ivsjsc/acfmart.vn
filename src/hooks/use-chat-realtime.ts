import { useEffect, useState } from "react"
import {
  chatService,
  type ChatMessage,
  type Conversation,
} from "../lib/firestore-chat"
import { useAuthStore } from "../stores/auth-store"

export function useConversations() {
  const userId = useAuthStore((s) => s.user?.id)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setConversations([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = chatService.subscribeConversations(userId, (next) => {
      setConversations(next)
      setLoading(false)
    })
    return unsub
  }, [userId])

  return { conversations, loading }
}

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = chatService.subscribeMessages(conversationId, (next) => {
      setMessages(next)
      setLoading(false)
    })
    return unsub
  }, [conversationId])

  return { messages, loading }
}

export function useSendChatMessage(conversationId: string, receiverId: string) {
  const userId = useAuthStore((s) => s.user?.id)
  return async (content: string) => {
    if (!userId || !content.trim()) return
    await chatService.sendMessage({
      conversationId,
      senderId: userId,
      receiverId,
      content: content.trim(),
    })
  }
}
