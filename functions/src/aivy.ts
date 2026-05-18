import { HttpsError, onCall } from "firebase-functions/v2/https"
import { defineSecret, defineString } from "firebase-functions/params"
import * as logger from "firebase-functions/logger"

const groqApiKey = defineSecret("GROQ_API_KEY")
const googleAiApiKey = defineSecret("GOOGLE_AI_API_KEY")
const groqModel = defineString("AIVY_GROQ_MODEL", {
  default: "llama-3.3-70b-versatile",
})
const geminiModel = defineString("AIVY_GEMINI_MODEL", {
  default: "gemini-2.0-flash",
})

const GROQ_API_BASE = "https://api.groq.com/openai/v1"
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"
const AIVY_HISTORY_LIMIT = 10

const AIVY_SYSTEM_PROMPT = `Bạn là Aivy, trợ lý AI tiếng Việt thuộc sở hữu của IVS JSC, hỗ trợ người dùng trên ACFMart.vn.
Nhiệm vụ: trả lời ngắn gọn, đúng dữ liệu, không vòng vo về mua sắm chính hãng, xác thực QR, đơn hàng, đổi trả, Seller Portal, voucher, seller và báo cáo hàng giả.
Thông tin pháp nhân: ACFMart do Công ty Cổ phần Công nghệ ACFMart (ACFMart JSC) sở hữu và vận hành; IVS JSC là cổ đông công nghệ và đối tác phát triển; Quỹ Chống Hàng Giả ACF giám sát định hướng chống hàng giả.
Phong cách: xưng "em" khi phù hợp, tối đa 2 đoạn ngắn hoặc 3 gạch đầu dòng, không nhận mình là Gemini/Groq/Google.
Quy tắc an toàn: chỉ dùng dữ liệu tài khoản/đơn hàng/seller khi ngữ cảnh hệ thống cung cấp; không bịa số dư ví, điểm thưởng, voucher, mã vận đơn, trạng thái đơn, trạng thái seller hoặc kết quả QR; không tự sửa/xóa đơn hàng, đổi mật khẩu, rút ví, đổi điểm hoặc gửi báo cáo khi chưa có xác nhận rõ ràng.
Phạm vi đã chốt: đơn hàng chỉ tra cứu đơn của user đang đăng nhập; ví/điểm/voucher chỉ hướng dẫn mở /account/wallet, /account/loyalty, /account/vouchers; QR chủ yếu hướng dẫn mở /qr-verify; chính sách dựa trên FAQ/legal; seller có thể kiểm tra trạng thái hồ sơ nếu context có; báo cáo hàng giả hướng dẫn /report-counterfeit hoặc link nháp.
Khi không chắc, nói rõ giới hạn và hướng người dùng tới kênh hỗ trợ ACFMart. Không tự nhận đã truy cập dữ liệu cá nhân nếu người dùng không cung cấp hoặc hệ thống không đưa dữ liệu đó.`

type AivyProvider = "auto" | "groq" | "gemini"

interface AivyCallableMessage {
  role?: unknown
  content?: unknown
}

interface AivyCallableRequest {
  message?: unknown
  history?: unknown
  provider?: unknown
  context?: unknown
}

interface GroqMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  promptFeedback?: {
    blockReason?: string
  }
  error?: {
    message?: string
  }
}

function sanitizeMessage(input: unknown) {
  return typeof input === "string" ? input.trim().slice(0, 4000) : ""
}

function sanitizeContext(input: unknown) {
  return typeof input === "string" ? input.trim().slice(0, 12000) : ""
}

function sanitizeHistory(input: unknown): GroqMessage[] {
  if (!Array.isArray(input)) return []

  return input
    .slice(-AIVY_HISTORY_LIMIT)
    .map((message: AivyCallableMessage) => {
      const role = message?.role === "assistant" ? "assistant" : "user"
      const content = sanitizeMessage(message?.content)
      return content ? ({ role, content } as GroqMessage) : null
    })
    .filter((message): message is GroqMessage => Boolean(message))
}

function normalizeProvider(input: unknown): AivyProvider {
  return input === "groq" || input === "gemini" || input === "auto" ? input : "auto"
}

async function callGroq(history: GroqMessage[], message: string, context: string) {
  const apiKey = groqApiKey.value()
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: groqModel.value(),
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        ...history,
        { role: "user", content: message },
      ],
      temperature: 0.2,
      max_tokens: 512,
      top_p: 0.9,
      stream: false,
    }),
  })

  const data = (await response.json()) as GroqChatResponse

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? `Groq HTTP ${response.status}`)
  }

  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error("Groq returned empty response")
  return text
}

function buildSystemPrompt(context: string) {
  if (!context) return AIVY_SYSTEM_PROMPT
  return [
    AIVY_SYSTEM_PROMPT,
    "",
    "# Ngữ cảnh hệ thống được phép dùng",
    "Chỉ dùng dữ liệu dưới đây để trả lời các câu hỏi về tài khoản/đơn hàng/seller. Nếu dữ liệu không có trong ngữ cảnh, nói rõ là em chưa có thông tin và hướng dẫn người dùng mở trang liên quan.",
    context,
  ].join("\n")
}

function toGeminiContents(history: GroqMessage[], message: string) {
  return [...history, { role: "user" as const, content: message }].map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }))
}

async function callGemini(history: GroqMessage[], message: string, context: string) {
  const apiKey = googleAiApiKey.value()
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured")
  }

  const response = await fetch(
    `${GEMINI_API_BASE}/models/${geminiModel.value()}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: toGeminiContents(history, message),
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(context) }],
        },
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 512,
        },
      }),
    }
  )

  const data = (await response.json()) as GeminiGenerateResponse

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? `Gemini HTTP ${response.status}`)
  }

  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked prompt: ${data.promptFeedback.blockReason}`)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) throw new Error("Gemini returned empty response")
  return text
}

export const aivyChat = onCall(
  {
    region: "asia-southeast1",
    secrets: [groqApiKey, googleAiApiKey],
    maxInstances: 20,
  },
  async (request) => {
    const data = request.data as AivyCallableRequest
    const message = sanitizeMessage(data?.message)
    const history = sanitizeHistory(data?.history)
    const provider = normalizeProvider(data?.provider)
    const context = sanitizeContext(data?.context)

    if (!message) {
      throw new HttpsError("invalid-argument", "Missing message")
    }

    try {
      if (provider === "groq") {
        return { reply: await callGroq(history, message, context), provider: "groq" }
      }

      if (provider === "gemini") {
        return { reply: await callGemini(history, message, context), provider: "gemini" }
      }

      try {
        return { reply: await callGroq(history, message, context), provider: "groq" }
      } catch (groqError) {
        logger.warn("Aivy Groq failed, falling back to Gemini", groqError)
        return { reply: await callGemini(history, message, context), provider: "gemini" }
      }
    } catch (error) {
      logger.error("Aivy chat failed", error)
      throw new HttpsError(
        "unavailable",
        "Aivy hiện chưa phản hồi được. Vui lòng thử lại sau hoặc liên hệ support@acfmart.vn."
      )
    }
  }
)
