export interface AivyMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  isStreaming?: boolean
  error?: string
}

export interface AivyConversation {
  id: string
  messages: AivyMessage[]
  createdAt: number
  updatedAt: number
}
