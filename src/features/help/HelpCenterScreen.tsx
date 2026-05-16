import { useMemo, useState } from "react"
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

  function switchView(next: HelpAudience) {
    if (next === "both") return
    const updated = new URLSearchParams(params)
    updated.set("audience", next)
    setParams(updated, { replace: true })
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
          chính hãng, vận hành bởi Quỹ Chống Hàng Giả VN.
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
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Link
          to={`/aivy?topic=${view === "seller" ? "seller" : "buyer"}`}
          className="card group flex items-center gap-4 overflow-hidden bg-gradient-to-br from-brand-red-50 to-brand-gold-50 p-5"
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
                {section.topics.slice(0, 5).map((topic) => (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = new URLSearchParams(params)
                        updated.set("topic", `${section.id}/${topic.id}`)
                        setParams(updated)
                      }}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-neutral-700 hover:bg-neutral-50"
                    >
                      <BookOpen
                        size={14}
                        className="mt-0.5 shrink-0 text-brand-red-500"
                      />
                      <span>
                        <span className="font-medium">{topic.title}</span>
                        {topic.summary && (
                          <span className="block text-xs text-neutral-500">
                            {topic.summary}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
                {section.topics.length > 5 && (
                  <li className="px-2 text-xs text-neutral-500">
                    + {section.topics.length - 5} chủ đề khác
                  </li>
                )}
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
          {filteredFaqs.map((faq) => (
            <details
              key={faq.id}
              className="group card overflow-hidden p-0 hover:border-brand-red-200"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4">
                <span className="font-medium text-neutral-900">
                  {faq.question}
                </span>
                <span className="mt-0.5 text-neutral-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-neutral-100 bg-neutral-50/40 px-4 py-3 text-sm text-neutral-700">
                {faq.answer}
              </div>
            </details>
          ))}
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
