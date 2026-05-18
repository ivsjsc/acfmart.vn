import { AIVY_SYSTEM_PROMPT } from "./system-prompt"
import { AIVY_MODEL_HISTORY_LIMIT } from "./aivy-history-service"
import type { AivyMessage } from "./types"

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || ""
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash"

const API_BASE = "https://generativelanguage.googleapis.com/v1beta"

interface GeminiContent {
  role: "user" | "model"
  parts: { text: string }[]
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: GeminiContent
    finishReason?: string
  }>
  promptFeedback?: {
    blockReason?: string
  }
  error?: {
    code: number
    message: string
    status: string
  }
}

function messagesToGeminiContents(messages: AivyMessage[]): GeminiContent[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-AIVY_MODEL_HISTORY_LIMIT)
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
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

export async function generateAivyReply(
  history: AivyMessage[],
  userMessage: string,
  signal?: AbortSignal,
  context?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Aivy hiện tại có một chút vấn đề chưa thể phản hồi tốt được. Aivy sẽ quay lại sau. Bây giờ nếu có câu hỏi hoặc vấn đề gấp thì hãy liên hệ support@acfmart.vn nhé."
    )
  }

  const contents = messagesToGeminiContents([
    ...history,
    {
      id: "tmp",
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    },
  ])

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: buildSystemPrompt(context) }],
    },
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 512,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  }

  const url = `${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  })

  const data: GeminiGenerateResponse = await res.json()

  if (data.error) {
    throw new Error("Aivy gặp môt chút trục trặc kỹ thuật, hẹn gặp lại bạn vào thời gian sớm nhất.");
  }

  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Câu hỏi của bạn bị Aivy từ chối: ${data.promptFeedback.blockReason}`
    )
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("Aivy không trả về nội dung. Vui lòng thử lại.")
  }

  return text.trim()
}
