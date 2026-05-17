"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aivyChat = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const logger = __importStar(require("firebase-functions/logger"));
const groqApiKey = (0, params_1.defineSecret)("GROQ_API_KEY");
const googleAiApiKey = (0, params_1.defineSecret)("GOOGLE_AI_API_KEY");
const groqModel = (0, params_1.defineString)("AIVY_GROQ_MODEL", {
    default: "llama-3.3-70b-versatile",
});
const geminiModel = (0, params_1.defineString)("AIVY_GEMINI_MODEL", {
    default: "gemini-2.0-flash",
});
const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const AIVY_SYSTEM_PROMPT = `Bạn là Aivy, trợ lý AI tiếng Việt của ACFMart.vn do IVS JSC phát triển cho Công ty Cổ phần Công nghệ ACFMart (ACFMart JSC).
Nhiệm vụ: hỗ trợ người mua và người bán về mua sắm chính hãng, xác thực QR, đơn hàng, đổi trả, Seller Portal, đăng sản phẩm, voucher, tài chính seller và quy trình kiểm duyệt.
Thông tin pháp nhân: ACFMart do Công ty Cổ phần Công nghệ ACFMart (ACFMart JSC) sở hữu và vận hành; IVS JSC là cổ đông công nghệ và đối tác phát triển; Quỹ Chống Hàng Giả ACF giám sát định hướng chống hàng giả.
Phong cách: xưng "em" khi phù hợp, trả lời rõ ràng, ngắn gọn, không nhận mình là Gemini/Groq/Google. Khi không chắc, nói rõ giới hạn và hướng người dùng tới kênh hỗ trợ ACFMart. Không tự nhận đã truy cập dữ liệu cá nhân nếu người dùng không cung cấp hoặc hệ thống không đưa dữ liệu đó.`;
function sanitizeMessage(input) {
    return typeof input === "string" ? input.trim().slice(0, 4000) : "";
}
function sanitizeHistory(input) {
    if (!Array.isArray(input))
        return [];
    return input
        .slice(-12)
        .map((message) => {
        const role = message?.role === "assistant" ? "assistant" : "user";
        const content = sanitizeMessage(message?.content);
        return content ? { role, content } : null;
    })
        .filter((message) => Boolean(message));
}
function normalizeProvider(input) {
    return input === "groq" || input === "gemini" || input === "auto" ? input : "auto";
}
async function callGroq(history, message) {
    const apiKey = groqApiKey.value();
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured");
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
                { role: "system", content: AIVY_SYSTEM_PROMPT },
                ...history,
                { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.9,
            stream: false,
        }),
    });
    const data = (await response.json());
    if (!response.ok || data.error) {
        throw new Error(data.error?.message ?? `Groq HTTP ${response.status}`);
    }
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text)
        throw new Error("Groq returned empty response");
    return text;
}
function toGeminiContents(history, message) {
    return [...history, { role: "user", content: message }].map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
    }));
}
async function callGemini(history, message) {
    const apiKey = googleAiApiKey.value();
    if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY is not configured");
    }
    const response = await fetch(`${GEMINI_API_BASE}/models/${geminiModel.value()}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: toGeminiContents(history, message),
            systemInstruction: {
                parts: [{ text: AIVY_SYSTEM_PROMPT }],
            },
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 1024,
            },
        }),
    });
    const data = (await response.json());
    if (!response.ok || data.error) {
        throw new Error(data.error?.message ?? `Gemini HTTP ${response.status}`);
    }
    if (data.promptFeedback?.blockReason) {
        throw new Error(`Gemini blocked prompt: ${data.promptFeedback.blockReason}`);
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text)
        throw new Error("Gemini returned empty response");
    return text;
}
exports.aivyChat = (0, https_1.onCall)({
    region: "asia-southeast1",
    secrets: [groqApiKey, googleAiApiKey],
    maxInstances: 20,
}, async (request) => {
    const data = request.data;
    const message = sanitizeMessage(data?.message);
    const history = sanitizeHistory(data?.history);
    const provider = normalizeProvider(data?.provider);
    if (!message) {
        throw new https_1.HttpsError("invalid-argument", "Missing message");
    }
    try {
        if (provider === "groq") {
            return { reply: await callGroq(history, message), provider: "groq" };
        }
        if (provider === "gemini") {
            return { reply: await callGemini(history, message), provider: "gemini" };
        }
        try {
            return { reply: await callGroq(history, message), provider: "groq" };
        }
        catch (groqError) {
            logger.warn("Aivy Groq failed, falling back to Gemini", groqError);
            return { reply: await callGemini(history, message), provider: "gemini" };
        }
    }
    catch (error) {
        logger.error("Aivy chat failed", error);
        throw new https_1.HttpsError("unavailable", "Aivy hiện chưa phản hồi được. Vui lòng thử lại sau hoặc liên hệ support@acfmart.vn.");
    }
});
//# sourceMappingURL=aivy.js.map