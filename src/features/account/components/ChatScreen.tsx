import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Image as ImageIcon,
  Inbox,
  Loader2,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { chatService } from "../../../lib/firestore-chat"
import { formatRelativeTime } from "../../../lib/format"
import {
  useChatMessages,
  useConversations,
  useSendChatMessage,
} from "../../../hooks/use-chat-realtime"
import { useAuthStore } from "../../../stores/auth-store"

export default function ChatScreen() {
  const user = useAuthStore((state) => state.user)
  const [params] = useSearchParams()
  const requestedConversationId = params.get("conversation")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { conversations, loading: conversationsLoading } = useConversations()
  const { messages, loading: messagesLoading } = useChatMessages(activeId)
  const activeConv =
    conversations.find((conversation) => conversation.id === activeId) ?? null
  const receiverId =
    activeConv?.participants.find((participantId) => participantId !== user?.id) ?? ""
  const sendMessage = useSendChatMessage(activeId ?? "", receiverId)

  const filtered = conversations.filter((conversation) =>
    search
      ? conversation.partyName.toLowerCase().includes(search.toLowerCase())
      : true
  )

  useEffect(() => {
    if (activeId && conversations.some((conversation) => conversation.id === activeId)) {
      return
    }
    if (
      requestedConversationId &&
      conversations.some((conversation) => conversation.id === requestedConversationId)
    ) {
      setActiveId(requestedConversationId)
      return
    }
    setActiveId(conversations[0]?.id ?? null)
  }, [activeId, conversations, requestedConversationId])

  useEffect(() => {
    if (!activeId || !user?.id) return
    chatService.markRead(activeId, user.id).catch(() => undefined)
  }, [activeId, user?.id, messages.length])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length])

  async function handleSendMessage() {
    if (!input.trim() || !activeId || !receiverId) return
    try {
      await sendMessage(input)
      setInput("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi tin nhắn")
    }
  }

  if (!user) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <Inbox size={48} className="text-neutral-300" />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">
          Đăng nhập để xem tin nhắn
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Hội thoại với shop và CSKH sẽ được đồng bộ theo tài khoản của bạn.
        </p>
        <Link to="/login" className="btn-primary mt-5">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid h-[calc(100vh-220px)] min-h-[500px] lg:grid-cols-[320px_1fr]">
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm hội thoại..."
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Đang tải hội thoại...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <Inbox size={40} className="text-neutral-300" />
                <h3 className="mt-3 text-sm font-bold text-neutral-900">
                  Chưa có hội thoại
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Khi bạn nhắn shop hoặc CSKH, hội thoại sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              filtered.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50",
                    activeId === conversation.id && "bg-brand-red-50"
                  )}
                >
                  <Avatar name={conversation.partyName} src={conversation.partyAvatar} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-neutral-900">
                        {conversation.partyName}
                      </span>
                      {conversation.lastMessageAt && (
                        <span className="shrink-0 text-[10px] text-neutral-500">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-neutral-600">
                        {conversation.lastMessage || "Chưa có tin nhắn"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="shrink-0 rounded-full bg-brand-red-500 px-1.5 text-[10px] font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className={cn("flex flex-col", !activeId && "hidden lg:flex")}>
          {activeConv ? (
            <>
              <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="rounded p-1 hover:bg-neutral-100 lg:hidden"
                  aria-label="Quay lại"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar name={activeConv.partyName} src={activeConv.partyAvatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-900">
                      {activeConv.partyName}
                    </span>
                    {activeConv.type === "shop" && (
                      <ShieldCheck size={12} className="text-brand-gold-500" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {activeConv.lastMessageAt
                      ? `Cập nhật ${formatRelativeTime(activeConv.lastMessageAt)}`
                      : "Hội thoại mới"}
                  </div>
                </div>
                <button className="rounded p-2 hover:bg-neutral-100" aria-label="Gọi">
                  <Phone size={16} />
                </button>
                <button className="rounded p-2 hover:bg-neutral-100" aria-label="Tùy chọn">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4"
              >
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-neutral-500">
                    <Loader2 size={16} className="animate-spin" />
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Chưa có tin nhắn. Hãy bắt đầu cuộc hội thoại.
                  </div>
                ) : (
                  messages.map((message) => {
                    const fromMe = message.senderId === user.id
                    return (
                      <div
                        key={message.id}
                        className={cn("flex animate-slide-up", fromMe ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                            fromMe
                              ? "rounded-br-md bg-brand-red-500 text-white"
                              : "rounded-bl-md bg-white text-neutral-900 ring-1 ring-neutral-200"
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          <div
                            className={cn(
                              "mt-1 text-[10px]",
                              fromMe ? "text-white/70" : "text-neutral-500"
                            )}
                          >
                            {message.timestamp.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {fromMe && (message.read ? " · Đã xem" : " · Đã gửi")}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

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
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="max-h-32 flex-1 resize-none rounded-2xl border border-neutral-200 px-4 py-2 text-sm focus:border-brand-red-400 focus:outline-none focus:ring-1 focus:ring-brand-red-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || !receiverId}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red-500 text-white transition-colors hover:bg-brand-red-600 disabled:bg-neutral-300"
                    aria-label="Gửi"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <div className="mt-1 text-center text-[10px] text-neutral-400">
                  Cần hỗ trợ ngoài giờ?{" "}
                  <Link to="/aivy" className="font-semibold text-brand-red-600">
                    Hỏi Aivy
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

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
      {name[0]?.toUpperCase() ?? "A"}
    </div>
  )
}
