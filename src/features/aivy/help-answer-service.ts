import { HELP_FAQS, HELP_SECTIONS } from "../help/help-data"

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

function tokenize(input: string): string[] {
  return normalize(input)
    .split(" ")
    .filter((word) => word.length >= 3)
}

function scoreQuery(query: string, text: string): number {
  const queryTokens = tokenize(query)
  const textNormalized = normalize(text)
  if (queryTokens.length === 0) return 0
  const matches = queryTokens.filter((token) => textNormalized.includes(token)).length
  return matches / queryTokens.length
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

  const faqMatches = HELP_FAQS.map((faq) => ({
    faq,
    score: scoreQuery(query, `${faq.question} ${faq.answer}`),
  })).sort((a, b) => b.score - a.score)

  const bestFaq = faqMatches[0]
  if (bestFaq && bestFaq.score >= 0.45) {
    const answer = `${bestFaq.faq.answer}\n\nNguồn: Trung tâm trợ giúp ACFMart. Bạn có thể xem thêm tại /help.`
    writeCache(query, answer)
    return answer
  }

  const sectionMatches = HELP_SECTIONS.flatMap((section) =>
    section.topics.map((topic) => ({
      section,
      topic,
      score: scoreQuery(query, `${section.title} ${section.description} ${topic.title} ${topic.summary ?? ""}`),
    }))
  ).sort((a, b) => b.score - a.score)

  const bestTopic = sectionMatches[0]
  if (bestTopic && bestTopic.score >= 0.55) {
    const answer = `Nội dung này nằm trong mục "${bestTopic.section.title}" của Trung tâm trợ giúp, phần "${bestTopic.topic.title}". ${bestTopic.topic.summary ?? ""}\n\nBạn xem thêm tại /help để được hướng dẫn chi tiết.`
    writeCache(query, answer)
    return answer
  }

  return null
}
