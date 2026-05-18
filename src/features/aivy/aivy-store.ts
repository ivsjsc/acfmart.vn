import { create } from "zustand"
import { createAivyWelcomeMessage, withAivyWelcome } from "./aivy-history-service"
import type { AivyMessage } from "./types"

interface AivyState {
  isOpen: boolean
  messages: AivyMessage[]
  isLoading: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setMessages: (messages: AivyMessage[]) => void
  addMessage: (msg: Omit<AivyMessage, "id" | "timestamp">) => AivyMessage
  updateMessage: (id: string, partial: Partial<AivyMessage>) => void
  setLoading: (loading: boolean) => void
  clearConversation: () => void
}

function genId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useAivyStore = create<AivyState>()((set) => ({
  isOpen: false,
  messages: [createAivyWelcomeMessage()],
  isLoading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setMessages: (messages) =>
    set({ messages: withAivyWelcome(messages), isLoading: false }),
  addMessage: (msg) => {
    const newMsg: AivyMessage = {
      ...msg,
      id: genId(),
      timestamp: Date.now(),
    }
    set((s) => ({ messages: [...s.messages, newMsg] }))
    return newMsg
  },
  updateMessage: (id, partial) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearConversation: () =>
    set({ messages: [createAivyWelcomeMessage()], isLoading: false }),
}))
