import type { AivyMessage } from "./types"
import { generateAivyReply } from "./gemini-service"
import { generateAivyReplyWithGroq } from "./groq-service"

export type AivyProvider = "groq" | "gemini" | "auto"

interface AivyChatOptions {
  provider?: AivyProvider
  signal?: AbortSignal
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

  // Nếu chỉ định rõ provider
  if (provider === "groq") {
    return generateAivyReplyWithGroq(history, userMessage, signal)
  }

  if (provider === "gemini") {
    return generateAivyReply(history, userMessage, signal)
  }

  // Auto mode: Ưu tiên Groq cho chat thông thường (nhanh, rẻ)
  // Fallback sang Gemini nếu Groq lỗi
  try {
    return await generateAivyReplyWithGroq(history, userMessage, signal)
  } catch (groqError) {
    console.warn("Groq failed, falling back to Gemini:", groqError)
    try {
      return await generateAivyReply(history, userMessage, signal)
    } catch (geminiError) {
      // Cả 2 đều lỗi, ném lỗi từ Groq (nguyên nhân chính)
      throw groqError
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
