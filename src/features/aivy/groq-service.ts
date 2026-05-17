import { AIVY_SYSTEM_PROMPT } from "./system-prompt"
import type { AivyMessage } from "./types"

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ""
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile"

const API_BASE = "https://api.groq.com/openai/v1"

interface GroqMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface GroqChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: GroqMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: {
    message: string
    type: string
    code: string
  }
}

function messagesToGroqFormat(messages: AivyMessage[]): GroqMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }))
}

export async function generateAivyReplyWithGroq(
  history: AivyMessage[],
  userMessage: string,
  signal?: AbortSignal
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      "Aivy hiện tại có một chút vấn đề chưa thể phản hồi tốt được. Aivy sẽ quay lại sau. Bây giờ nếu có câu hỏi hoặc vấn đề gấp thì hãy Liên hệ ngay Email: support@ivsacademy.edu.vn nhé."
    )
  }

  const systemMessage: GroqMessage = {
    role: "system",
    content: AIVY_SYSTEM_PROMPT,
  }

  const messages: GroqMessage[] = [
    systemMessage,
    ...messagesToGroqFormat(history),
    { role: "user", content: userMessage },
  ]

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9,
    stream: false,
  }

  const url = `${API_BASE}/chat/completions`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  })

  const data: GroqChatResponse = await res.json()

  if (data.error) {
    throw new Error(`Groq lỗi: ${data.error.message}`)
  }

  const text = data.choices?.[0]?.message?.content
  if (!text) {
    throw new Error("Aivy không trả về nội dung. Vui lòng thử lại.")
  }

  return text.trim()
}
