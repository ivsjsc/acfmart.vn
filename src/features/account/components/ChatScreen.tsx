import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Send,
  Search,
  Phone,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react"
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, type MockChatMessage } from "../mock-data"
import { formatRelativeTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"

export default function ChatScreen() {
  const [activeId, setActiveId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.id ?? null)
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Record<string, MockChatMessage[]>>(MOCK_MESSAGES)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = MOCK_CONVERSATIONS.filter((c) =>
    search ? c.partyName.toLowerCase().includes(search.toLowerCase()) : true
  )
  const activeConv = MOCK_CONVERSATIONS.find((c) => c.id === activeId)
  const activeMessages = activeId ? messages[activeId] ?? [] : []

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [activeMessages.length])

  function sendMessage() {
    if (!input.trim() || !activeId) return
    const newMsg: MockChatMessage = {
      id: `m_${Date.now()}`,
      conversationId: activeId,
      fromMe: true,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), newMsg],
    }))
    setInput("")

    // Simulate auto reply after 1.5s
    setTimeout(() => {
      const reply: MockChatMessage = {
        id: `m_${Date.now()}_r`,
        conversationId: activeId,
        fromMe: false,
        content: "Cảm ơn bạn, shop đã ghi nhận. Sẽ phản hồi trong ít phút!",
        timestamp: new Date().toISOString(),
        read: true,
      }
      setMessages((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), reply],
      }))
    }, 1500)
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid h-[calc(100vh-220px)] min-h-[500px] lg:grid-cols-[320px_1fr]">
        {/* Conversations list */}
        <aside
          className={cn(
            "flex flex-col border-r border-neutral-200",
            activeId && "hidden lg:flex"
          )}
        >
          <div className="border-b border-neutral-200 p-3">
            <h2 className="mb-2 text-base font-bold text-neutral-900">Tin nhắn</h2>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm hội thoại..."
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50",
                  activeId === conv.id && "bg-brand-red-50"
                )}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.partyAvatar}
                    alt={conv.partyName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-neutral-900">
                      {conv.partyName}
                    </span>
                    <span className="shrink-0 text-[10px] text-neutral-500">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-neutral-600">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-brand-red-500 px-1.5 text-[10px] font-bold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Active conversation */}
        <section className={cn("flex flex-col", !activeId && "hidden lg:flex")}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="rounded p-1 hover:bg-neutral-100 lg:hidden"
                  aria-label="Quay lại"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <img
                    src={activeConv.partyAvatar}
                    alt={activeConv.partyName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  {activeConv.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-900">
                      {activeConv.partyName}
                    </span>
                    {activeConv.type === "shop" && (
                      <ShieldCheck size={12} className="text-brand-gold-500" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {activeConv.isOnline ? "Đang online" : `Hoạt động ${formatRelativeTime(activeConv.lastMessageAt)}`}
                  </div>
                </div>
                <button className="rounded p-2 hover:bg-neutral-100">
                  <Phone size={16} />
                </button>
                <button className="rounded p-2 hover:bg-neutral-100">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
                {activeMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Chưa có tin nhắn. Hãy bắt đầu cuộc hội thoại.
                  </div>
                ) : (
                  activeMessages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex animate-slide-up",
                        m.fromMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                          m.fromMe
                            ? "rounded-br-md bg-brand-red-500 text-white"
                            : "rounded-bl-md bg-white text-neutral-900 ring-1 ring-neutral-200"
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">{m.content}</div>
                        <div className={cn("mt-1 text-[10px]", m.fromMe ? "text-white/70" : "text-neutral-500")}>
                          {new Date(m.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {m.fromMe && (m.read ? " · Đã xem" : " · Đã gửi")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="border-t border-neutral-200 bg-white p-3">
                <div className="flex items-end gap-2">
                  <button className="rounded p-2 text-neutral-500 hover:bg-neutral-100">
                    <Paperclip size={18} />
                  </button>
                  <button className="rounded p-2 text-neutral-500 hover:bg-neutral-100">
                    <ImageIcon size={18} />
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="max-h-32 flex-1 resize-none rounded-2xl border border-neutral-200 px-4 py-2 text-sm focus:border-brand-red-400 focus:outline-none focus:ring-1 focus:ring-brand-red-400"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red-500 text-white transition-colors hover:bg-brand-red-600 disabled:bg-neutral-300"
                    aria-label="Gửi"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <div className="mt-1 text-center text-[10px] text-neutral-400">
                  💡 Tip: Cần CSKH ngoài giờ? Hỏi{" "}
                  <Link to="/aivy" className="font-semibold text-brand-red-600">
                    Aivy
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-neutral-500">
              Chọn một hội thoại để bắt đầu
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
