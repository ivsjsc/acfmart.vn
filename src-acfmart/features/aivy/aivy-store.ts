import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AIVY_WELCOME_MESSAGE } from "./system-prompt"
import type { AivyMessage } from "./types"

interface AivyState {
  isOpen: boolean
  messages: AivyMessage[]
  isLoading: boolean
  open: () => void
  close: () => void
  toggle: () => void
  addMessage: (msg: Omit<AivyMessage, "id" | "timestamp">) => AivyMessage
  updateMessage: (id: string, partial: Partial<AivyMessage>) => void
  setLoading: (loading: boolean) => void
  clearConversation: () => void
}

function createWelcomeMessage(): AivyMessage {
  return {
    id: `msg_${Date.now()}_welcome`,
    role: "assistant",
    content: AIVY_WELCOME_MESSAGE,
    timestamp: Date.now(),
  }
}

function genId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useAivyStore = create<AivyState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [createWelcomeMessage()],
      isLoading: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
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
        set({ messages: [createWelcomeMessage()], isLoading: false }),
    }),
    {
      name: "acfmart-aivy",
      partialize: (state) => ({ messages: state.messages }),
    }
  )
)
