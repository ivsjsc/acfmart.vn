import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  Search,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Package,
  RotateCcw,
  Tag,
  Settings,
  Store,
  MessageCircle,
  ArrowRight,
  BookOpen,
  FileText,
  ChevronDown,
} from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"
import { HELP_SECTIONS, HELP_FAQS, type HelpAudience } from "./help-data"

const SECTION_ICON: Record<string, typeof Package> = {
  shopping: Package,
  promotions: Tag,
  payments: CreditCard,
  "orders-shipping": Package,
  "returns-refunds": RotateCcw,
  general: Settings,
  seller: Store,
}

function matchAudience(audience: HelpAudience, view: HelpAudience): boolean {
  if (audience === "both") return true
  return audience === view
}

export function HelpCenterScreen() {
  const user = useAuthStore((s) => s.user)
  const [params, setParams] = useSearchParams()
  const audienceParam = params.get("audience") as HelpAudience | null

  // If the URL specifies an audience, honour it. Otherwise default to "seller"
  // for users with the seller role, "buyer" for everyone else (incl. guests).
  const view: HelpAudience =
    audienceParam === "seller" || audienceParam === "buyer"
      ? audienceParam
      : user?.role === "seller"
      ? "seller"
      : "buyer"

  const [search, setSearch] = useState("")
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)
  const selectedTopic = params.get("topic")

  const sections = useMemo(
    () => HELP_SECTIONS.filter((s) => matchAudience(s.audience, view)),
    [view]
  )

  const faqs = useMemo(
    () => HELP_FAQS.filter((f) => matchAudience(f.audience, view)),
    [view]
  )

  const normalizedSearch = search.trim().toLowerCase()
  const filteredFaqs = normalizedSearch
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(normalizedSearch) ||
          f.answer.toLowerCase().includes(normalizedSearch)
      )
    : faqs

  // Khi mở trang qua deep-link (?topic=section/topic), tự cuộn tới topic được
  // chọn một lần. Toggle thủ công sau đó không kích hoạt lại.
  const didInitialScrollRef = useRef(false)
  useEffect(() => {
    if (didInitialScrollRef.current || !selectedTopic) return
    didInitialScrollRef.current = true
    requestAnimationFrame(() => {
      document
        .getElementById(`help-topic-${selectedTopic.replace("/", "-")}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }, [selectedTopic])

  function switchView(next: HelpAudience) {
    if (next === "both") return
    const updated = new URLSearchParams(params)
    updated.set("audience", next)
    updated.delete("topic")
    setParams(updated, { replace: true })
    setOpenFaqId(null)
  }

  function toggleTopic(topicKey: string) {
    const updated = new URLSearchParams(params)
    if (selectedTopic === topicKey) {
      updated.delete("topic")
    } else {
      updated.set("topic", topicKey)
    }
    setParams(updated)
  }

  function relatedFaqsForTopic(sectionId: string, topicId: string) {
    const source = `${sectionId} ${topicId}`.toLowerCase()
    return faqs.filter((faq) => {
      const text = `${faq.id} ${faq.question} ${faq.answer}`.toLowerCase()
      if (source.includes("place-order") || source.includes("address")) {
        return text.includes("đặt") || text.includes("địa chỉ")
      }
      if (source.includes("track") || source.includes("shipping")) {
        return text.includes("vận") || text.includes("tra cứu")
      }
      if (source.includes("payment") || source.includes("wallet") || source.includes("cod")) {
        return text.includes("thanh toán") || text.includes("cod")
      }
      if (source.includes("return") || source.includes("refund")) {
        return text.includes("đổi trả") || text.includes("hoàn")
      }
      if (source.includes("counterfeit") || source.includes("qr")) {
        return text.includes("hàng giả") || text.includes("qr")
      }
      if (source.includes("seller") || source.includes("inventory") || source.includes("finance")) {
        return text.includes("người bán") || text.includes("sản phẩm") || text.includes("tiền")
      }
      return false
    }).slice(0, 3)
  }

  return (
    <div className="container-acf py-6 lg:py-10">
      {/* Hero */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-600">
          Trung tâm trợ giúp ACFMart
        </p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900 lg:text-3xl">
          Chúng tôi có thể giúp gì cho bạn?
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Hướng dẫn chính thức của sàn ACFMart — chống hàng giả, xác minh
          chính hãng, do IVS JSC vận hành cùng hệ sinh thái xác thực ACF.
        </p>

        {/* Audience switch */}
        <div className="mt-5 inline-flex rounded-full border border-neutral-200 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => switchView("buyer")}
            className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
              view === "buyer"
                ? "bg-brand-red-600 text-white"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Khách mua
          </button>
          <button
            type="button"
            onClick={() => switchView("seller")}
            className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
              view === "seller"
                ? "bg-brand-red-600 text-white"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Người bán
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              view === "seller"
                ? "Tìm câu trả lời cho người bán..."
                : "Tìm câu trả lời cho khách mua..."
            }
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Quick-link banner — Aivy + role-specific shortcuts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Link
          to={`/aivy?topic=${view === "seller" ? "seller" : "buyer"}`}
          className="card group flex items-center gap-4 overflow-hidden bg-gradient-to-br from-brand-red-50 to-brand-gold-50 p-5 lg:col-span-2"
        >
          <div className="rounded-xl bg-white p-3 text-brand-gold-600 shadow-sm">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-neutral-900">
              Hỏi Aivy — trợ lý AI của ACFMart
            </h2>
            <p className="mt-1 text-xs text-neutral-700">
              Aivy biết quy chuẩn ACFMart, hỗ trợ 24/7. Có thể trả lời nhanh
              các thắc mắc về đơn hàng, kiểm duyệt, chính sách.
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-brand-red-700 group-hover:gap-2 transition-all">
            Chat ngay <ArrowRight size={14} />
            </span>
        </Link>

        <Link
          to="/legal"
          className="card flex items-center gap-3 p-5 hover:border-brand-red-300"
        >
          <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Trung tâm chính sách
            </h3>
            <p className="text-xs text-neutral-600">
              Xem rõ giữ tiền, COD, đổi trả và vận chuyển.
            </p>
          </div>
        </Link>

        <Link
          to="/contact"
          className="card flex items-center gap-3 p-5 hover:border-brand-red-300"
        >
          <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Liên hệ CSKH
            </h3>
            <p className="text-xs text-neutral-600">
              Hỗ trợ trực tiếp khi Aivy chưa giải đáp được.
            </p>
          </div>
        </Link>
      </div>

      {/* Sections grid */}
      <h2 className="mt-10 mb-4 text-xl font-bold text-neutral-900">
        Tra cứu theo chủ đề
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = SECTION_ICON[section.id] ?? ShieldCheck
          return (
            <div
              key={section.id}
              className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  {section.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-600">{section.description}</p>
              <ul className="mt-1 space-y-1 text-sm">
                {section.topics.map((topic) => {
                  const topicKey = `${section.id}/${topic.id}`
                  const isOpen = selectedTopic === topicKey
                  const relatedFaqs = relatedFaqsForTopic(section.id, topic.id)
                  return (
                  <li
                    key={topic.id}
                    id={`help-topic-${section.id}-${topic.id}`}
                    className="rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTopic(topicKey)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-neutral-700 hover:bg-neutral-50"
                    >
                      <BookOpen
                        size={14}
                        className="mt-0.5 shrink-0 text-brand-red-500"
                      />
                      <span className="flex-1">
                        <span className="font-medium">{topic.title}</span>
                        {topic.summary && (
                          <span className="block text-xs text-neutral-500">
                            {topic.summary}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`mt-0.5 shrink-0 text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="mx-2 mb-2 rounded-lg border border-brand-red-100 bg-brand-red-50/50 p-3 text-xs text-neutral-700">
                        <p className="whitespace-pre-line leading-relaxed">
                          {topic.answer}
                        </p>
                        {relatedFaqs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="font-semibold text-neutral-900">
                              Câu hỏi liên quan:
                            </p>
                            {relatedFaqs.map((faq) => (
                              <button
                                key={faq.id}
                                type="button"
                                onClick={() => {
                                  setOpenFaqId(faq.id)
                                  requestAnimationFrame(() => {
                                    document
                                      .getElementById(`help-faq-${faq.id}`)
                                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                                  })
                                }}
                                className="block text-left font-medium text-brand-red-700 hover:underline"
                              >
                                {faq.question}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            to={`/aivy?ask=${encodeURIComponent(topicKey)}`}
                            className="rounded-full bg-white px-3 py-1 font-semibold text-brand-red-700 ring-1 ring-brand-red-200 hover:bg-brand-red-50"
                          >
                            Hỏi Aivy về mục này
                          </Link>
                          <Link
                            to="/contact"
                            className="rounded-full bg-white px-3 py-1 font-semibold text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
                          >
                            Liên hệ CSKH
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>
                )})}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Popular FAQs */}
      <h2 className="mt-10 mb-4 text-xl font-bold text-neutral-900">
        Câu hỏi thường gặp
      </h2>
      {filteredFaqs.length === 0 ? (
        <div className="card p-6 text-center text-sm text-neutral-600">
          Không tìm thấy câu hỏi phù hợp.{" "}
          <Link
            to={`/aivy?topic=${view}`}
            className="font-semibold text-brand-red-700 hover:underline"
          >
            Hỏi Aivy
          </Link>{" "}
          hoặc{" "}
          <Link
            to="/contact"
            className="font-semibold text-brand-red-700 hover:underline"
          >
            liên hệ CSKH
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id
            return (
            <div
              key={faq.id}
              id={`help-faq-${faq.id}`}
              className="group card overflow-hidden p-0 hover:border-brand-red-200"
            >
              <button
                type="button"
                onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-start justify-between gap-3 p-4 text-left"
              >
                <span className="font-medium text-neutral-900">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`mt-0.5 shrink-0 text-neutral-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-neutral-100 bg-neutral-50/40 px-4 py-3 text-sm text-neutral-700">
                  {faq.answer}
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* CTA bottom */}
      <div className="mt-10 rounded-2xl bg-brand-red-50 p-6">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              Vẫn chưa giải đáp được thắc mắc?
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Aivy luôn online, hoặc bạn có thể gửi yêu cầu để CSKH ACFMart
              hỗ trợ trực tiếp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/aivy?topic=${view}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sparkles size={16} /> Hỏi Aivy
            </Link>
            <Link to="/contact" className="btn-secondary inline-flex items-center gap-2">
              <MessageCircle size={16} /> Liên hệ CSKH
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
