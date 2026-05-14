import { AIVY_SYSTEM_PROMPT } from "./system-prompt"
import type { AivyMessage } from "./types"

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || ""
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-pro"

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
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }))
}

export async function generateAivyReply(
  history: AivyMessage[],
  userMessage: string,
  signal?: AbortSignal
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Aivy hiện tại có một chút vấn đề chưa thể phản hồi tốt được. Aivy sẽ quay lại sau. Bây giờ nếu có câu hỏi hoặc vấn đề gấp thì hãy Liên hệ ngay Email: support@ivsacademy.edu.vn nhé."
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
      parts: [{ text: AIVY_SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
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
