import { AIVY_SYSTEM_PROMPT } from "./system-prompt"
import { AIVY_MODEL_HISTORY_LIMIT } from "./aivy-history-service"
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
    .slice(-AIVY_MODEL_HISTORY_LIMIT)
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }))
}

function buildSystemPrompt(context?: string): string {
  if (!context?.trim()) return AIVY_SYSTEM_PROMPT
  return [
    AIVY_SYSTEM_PROMPT,
    "",
    "# Ngữ cảnh hệ thống được phép dùng",
    "Chỉ dùng dữ liệu dưới đây để trả lời các câu hỏi về tài khoản/đơn hàng/seller. Nếu dữ liệu không có trong ngữ cảnh, nói rõ là em chưa có thông tin và hướng dẫn người dùng mở trang liên quan. Không tự bịa số dư, trạng thái, mã vận đơn hoặc kết quả xác thực.",
    context.trim(),
  ].join("\n")
}

export async function generateAivyReplyWithGroq(
  history: AivyMessage[],
  userMessage: string,
  signal?: AbortSignal,
  context?: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      "Aivy hiện tại có một chút vấn đề chưa thể phản hồi tốt được. Aivy sẽ quay lại sau. Bây giờ nếu có câu hỏi hoặc vấn đề gấp thì hãy liên hệ support@acfmart.vn nhé."
    )
  }

  const systemMessage: GroqMessage = {
    role: "system",
    content: buildSystemPrompt(context),
  }

  const messages: GroqMessage[] = [
    systemMessage,
    ...messagesToGroqFormat(history),
    { role: "user", content: userMessage },
  ]

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.2,
    max_tokens: 512,
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
