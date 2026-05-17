import type { AivyMessage } from "./types"
import { generateAivyReply } from "./gemini-service"
import { generateAivyReplyWithGroq } from "./groq-service"
import { httpsCallable } from "firebase/functions"
import { functions } from "../../lib/firebase"

export type AivyProvider = "groq" | "gemini" | "auto"

interface AivyChatOptions {
  provider?: AivyProvider
  signal?: AbortSignal
}

interface AivyCallableResponse {
  reply?: unknown
  provider?: unknown
}

async function generateAivyReplyWithCloudFunction(
  history: AivyMessage[],
  userMessage: string,
  provider: AivyProvider
) {
  const callable = httpsCallable<
    { history: Array<Pick<AivyMessage, "role" | "content">>; message: string; provider: AivyProvider },
    AivyCallableResponse
  >(functions, "aivyChat")

  const result = await callable({
    history: history
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-12)
      .map((message) => ({ role: message.role, content: message.content })),
    message: userMessage,
    provider,
  })

  if (typeof result.data.reply !== "string" || !result.data.reply.trim()) {
    throw new Error("Aivy không trả về nội dung. Vui lòng thử lại.")
  }

  return result.data.reply.trim()
}

async function generateAivyReplyDirect(
  history: AivyMessage[],
  userMessage: string,
  provider: AivyProvider,
  signal?: AbortSignal
) {
  if (provider === "groq") {
    return generateAivyReplyWithGroq(history, userMessage, signal)
  }

  if (provider === "gemini") {
    return generateAivyReply(history, userMessage, signal)
  }

  try {
    return await generateAivyReplyWithGroq(history, userMessage, signal)
  } catch (groqError) {
    console.warn("Groq failed, falling back to Gemini:", groqError)
    return generateAivyReply(history, userMessage, signal)
  }
}

/**
 * Aivy Core - Điều phối AI giữa Groq và Gemini
 * 
 * Chiến lược phân bổ:
 * - Groq (llama-3.3-70b): Chat thời gian thực, phân loại ý định, tóm tắt nhanh
 *   → Tốc độ <200ms, chi phí rất thấp
 * - Gemini (gemini-pro/flash): Phân tích hình ảnh, soạn email phức tạp, ngữ cảnh dài
 *   → Cửa sổ ngữ lý lớn, khả năng đa phương thức
 */
export async function generateAivyResponse(
  history: AivyMessage[],
  userMessage: string,
  options: AivyChatOptions = {}
): Promise<string> {
  const { provider = "auto", signal } = options
  const preferCloudFunction =
    import.meta.env.PROD || import.meta.env.VITE_AIVY_USE_CLOUD_FUNCTION === "true"

  if (preferCloudFunction) {
    try {
      return await generateAivyReplyWithCloudFunction(history, userMessage, provider)
    } catch (cloudError) {
      console.warn("Aivy Cloud Function failed, falling back to direct providers:", cloudError)
      try {
        return await generateAivyReplyDirect(history, userMessage, provider, signal)
      } catch {
        throw cloudError
      }
    }
  }

  try {
    return await generateAivyReplyDirect(history, userMessage, provider, signal)
  } catch (directError) {
    console.warn("Aivy direct providers failed, falling back to Cloud Function:", directError)
    try {
      return await generateAivyReplyWithCloudFunction(history, userMessage, provider)
    } catch {
      throw directError
    }
  }
}

/**
 * Kiểm tra provider nào khả dụng
 */
export function checkAvailableProviders(): {
  groq: boolean
  gemini: boolean
} {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || ""
  const geminiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || ""

  return {
    groq: groqKey.length > 0 && groqKey !== "gsk_...",
    gemini: geminiKey.length > 0 && !geminiKey.startsWith("AIzaSy..."),
  }
}

/**
 * Chọn provider tối ưu dựa trên loại tác vụ
 */
export function selectOptimalProvider(taskType: "chat" | "vision" | "long-context" | "classification"): AivyProvider {
  switch (taskType) {
    case "vision":
    case "long-context":
      return "gemini" // Gemini có vision và context window lớn
    case "chat":
    case "classification":
    default:
      return "groq" // Groq nhanh hơn cho chat thường
  }
}
