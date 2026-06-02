import { HELP_FAQS, HELP_SECTIONS, type HelpSection, type HelpTopic } from "../help/help-data"

const CACHE_KEY = "acfmart-aivy-faq-cache-v1"
const CACHE_TTL_MS = 1000 * 60 * 60 * 24

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Từ phổ biến tiếng Việt (đã bỏ dấu) — loại bỏ để tránh khớp nhiễu khi chấm
// điểm câu hỏi tự do (vd: "làm", "sao", "không", "liên quan").
const STOPWORDS = new Set([
  "lam", "sao", "the", "nao", "cho", "minh", "toi", "ban", "hoi", "ve", "khong",
  "duoc", "nhu", "nay", "cua", "khi", "muon", "can", "bi", "se", "thi", "voi",
  "tai", "trong", "tren", "den", "lien", "quan", "moi", "khac", "vay", "phai",
  "gi", "la", "co", "va", "do", "thi",
])

function tokenize(input: string): string[] {
  const seen = new Set<string>()
  for (const word of normalize(input).split(" ")) {
    if (word.length >= 3 && !STOPWORDS.has(word)) seen.add(word)
  }
  return [...seen]
}

interface QueryScore {
  score: number
  matched: number
}

function scoreQuery(queryTokens: string[], text: string): QueryScore {
  if (queryTokens.length === 0) return { score: 0, matched: 0 }
  const textNormalized = normalize(text)
  const matched = queryTokens.filter((token) => textNormalized.includes(token)).length
  return { score: matched / queryTokens.length, matched }
}

function readCache(): Record<string, { answer: string; createdAt: number }> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeCache(query: string, answer: string) {
  const cache = readCache()
  cache[normalize(query)] = { answer, createdAt: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

export function findCachedAivyHelpAnswer(query: string): string | null {
  const item = readCache()[normalize(query)]
  if (!item || Date.now() - item.createdAt > CACHE_TTL_MS) return null
  return item.answer
}

export function findAivyHelpAnswer(query: string): string | null {
  const cached = findCachedAivyHelpAnswer(query)
  if (cached) return cached

  // Fallback bảo thủ: cần ≥2 từ khoá có nghĩa và phần lớn từ khoá khớp, để chỉ
  // trả lời khi thật sự liên quan (câu mơ hồ sẽ rơi về luồng AI thay vì canned).
  const queryTokens = tokenize(query)
  if (queryTokens.length < 2) return null

  const faqMatches = HELP_FAQS.map((faq) => ({
    faq,
    ...scoreQuery(queryTokens, `${faq.question} ${faq.answer}`),
  })).sort((a, b) => b.score - a.score)

  const bestFaq = faqMatches[0]
  if (bestFaq && bestFaq.matched >= 2 && bestFaq.score >= 0.6) {
    const answer = `${bestFaq.faq.answer}\n\nNguồn: Trung tâm trợ giúp ACFMart. Bạn có thể xem thêm tại /help.`
    writeCache(query, answer)
    return answer
  }

  // Chấm điểm trên metadata ngắn gọn (tiêu đề + mô tả + tóm tắt), nhưng trả về
  // câu trả lời đầy đủ của topic — tránh việc answer dài làm nhiễu điểm số.
  const sectionMatches = HELP_SECTIONS.flatMap((section) =>
    section.topics.map((topic) => ({
      section,
      topic,
      ...scoreQuery(
        queryTokens,
        `${section.title} ${section.description} ${topic.title} ${topic.summary ?? ""}`
      ),
    }))
  ).sort((a, b) => b.score - a.score)

  const bestTopic = sectionMatches[0]
  if (bestTopic && bestTopic.matched >= 2 && bestTopic.score >= 0.6) {
    const answer = `${bestTopic.topic.answer}\n\nNguồn: Trung tâm trợ giúp ACFMart, mục "${bestTopic.section.title}". Xem thêm tại /help.`
    writeCache(query, answer)
    return answer
  }

  return null
}

// ─── Hỏi Aivy về mục này ───────────────────────────────────────────────────
// Bridge giữa Trung tâm trợ giúp và Aivy: nút "Hỏi Aivy về mục này" điều hướng
// tới /aivy?ask=<sectionId>/<topicId>. Aivy đọc param, gieo sẵn câu hỏi của
// người dùng và câu trả lời đầy đủ lấy thẳng từ help-data (không cần gọi AI).

export interface AivyHelpTopicSeed {
  question: string
  answer: string
}

function findHelpTopicByKey(
  topicKey: string
): { section: HelpSection; topic: HelpTopic } | null {
  const separator = topicKey.indexOf("/")
  if (separator < 0) return null
  const sectionId = topicKey.slice(0, separator)
  const topicId = topicKey.slice(separator + 1)
  const section = HELP_SECTIONS.find((s) => s.id === sectionId)
  if (!section) return null
  const topic = section.topics.find((t) => t.id === topicId)
  if (!topic) return null
  return { section, topic }
}

/**
 * Dựng cặp hỏi/đáp cho một topic trong Trung tâm trợ giúp.
 * Trả về null nếu topicKey không khớp topic nào (param lạ).
 */
export function buildAivyHelpTopicSeed(topicKey: string): AivyHelpTopicSeed | null {
  const match = findHelpTopicByKey(topicKey)
  if (!match) return null
  const { section, topic } = match
  return {
    question: `Cho mình hỏi về "${topic.title}" (${section.title}).`,
    answer: `${topic.answer}\n\nBạn xem thêm tại Trung tâm trợ giúp: /help`,
  }
}
