import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Inbox,
  Loader2,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatRelativeTime } from "../../../lib/format"
import { useAuthStore } from "../../../stores/auth-store"
import { generateAivyReply } from "../../aivy/gemini-service"
import { collection, doc, setDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore"
import { firestore } from "../../../lib/firebase"

interface SupportTicket {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userEmail?: string
  subject: string
  status: "pending" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  category: "general" | "order" | "payment" | "product" | "account" | "guide"
  lastMessage: string
  lastMessageAt: any
  createdAt: any
}

export default function UserSupportChatScreen() {
  const user = useAuthStore((state) => state.user)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState<SupportTicket["category"]>("general")
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const [ticketMessages, setTicketMessages] = useState<any[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)

  // Subscribe to user's support tickets
  useEffect(() => {
    if (!user) return
    
    setIsLoadingTickets(true)
    const q = query(
      collection(firestore, "supportTickets"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    )
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const ticketsData: SupportTicket[] = snap.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || "",
          userName: data.userName || "Tôi",
          userAvatar: data.userAvatar,
          userEmail: data.userEmail,
          subject: data.subject || "Không có tiêu đề",
          status: data.status || "pending",
          priority: data.priority || "medium",
          category: data.category || "general",
          lastMessage: data.lastMessage || "",
          lastMessageAt: data.lastMessageAt,
          createdAt: data.createdAt,
        }
      })
      setTickets(ticketsData)
      setIsLoadingTickets(false)
      
      // Auto-select first ticket if none selected
      if (!activeId && ticketsData.length > 0) {
        setActiveId(ticketsData[0].id)
      }
    }, (err) => {
      console.error("Error subscribing to support tickets:", err)
      setIsLoadingTickets(false)
    })

    return () => unsubscribe()
  }, [user])

  // Subscribe to messages of the active support ticket
  useEffect(() => {
    if (!activeId) {
      setTicketMessages([])
      setMessagesLoading(false)
      return
    }
    setMessagesLoading(true)
    const q = query(
      collection(firestore, "supportTickets", activeId, "messages"),
      orderBy("timestamp", "asc"),
      limit(200)
    )
    const unsub = onSnapshot(q, (snap) => {
      setTicketMessages(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            senderId: data.senderId,
            senderName: data.senderName,
            content: data.content,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : (data.timestamp?.toDate?.() ?? new Date()),
            read: data.read ?? false,
            isAutoReply: data.isAutoReply ?? false,
          }
        })
      )
      setMessagesLoading(false)
    }, () => setMessagesLoading(false))
    return unsub
  }, [activeId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [ticketMessages.length])

  async function handleCreateTicket() {
    if (!user || !subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề")
      return
    }

    setIsCreatingTicket(true)
    try {
      // Create support ticket
      const ticketRef = doc(collection(firestore, "supportTickets"))
      const ticketData = {
        userId: user.id,
        userName: user.name || user.email,
        userAvatar: user.avatar,
        userEmail: user.email,
        subject: subject.trim(),
        status: "pending" as const,
        priority: "medium" as const,
        category,
        lastMessage: input.trim() || subject.trim(),
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        unreadCount: 0,
      }

      await setDoc(ticketRef, ticketData)
      
      // Create initial message if user typed something
      if (input.trim()) {
        const messagesRef = collection(firestore, "supportTickets", ticketRef.id, "messages")
        await setDoc(doc(messagesRef), {
          senderId: user.id,
          senderRole: "user",
          content: input.trim(),
          timestamp: serverTimestamp(),
          read: false,
        })
      }

      toast.success("Đã gửi yêu cầu hỗ trợ! Aivy sẽ trả lời bạn sớm.")
      setSubject("")
      setInput("")
      setShowNewTicketForm(false)
      setActiveId(ticketRef.id)
    } catch (err) {
      console.error("Error creating ticket:", err)
      toast.error("Không thể tạo yêu cầu hỗ trợ")
    } finally {
      setIsCreatingTicket(false)
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || !activeId) return
    
    try {
      // Add user message to ticket
      const messagesRef = collection(firestore, "supportTickets", activeId, "messages")
      await setDoc(doc(messagesRef), {
        senderId: user!.id,
        senderRole: "user",
        content: input.trim(),
        timestamp: serverTimestamp(),
        read: false,
      })

      // Update ticket last message
      const ticketRef = doc(firestore, "supportTickets", activeId)
      await setDoc(ticketRef, {
        lastMessage: input.trim().slice(0, 100),
        lastMessageAt: serverTimestamp(),
      }, { merge: true })

      setInput("")

      // Trigger Aivy auto-response for guide-related questions
      const isGuideRelated = 
        input.toLowerCase().includes("hướng dẫn") ||
        input.toLowerCase().includes("cách") ||
        input.toLowerCase().includes("help") ||
        input.toLowerCase().includes("guide") ||
        category === "guide"

      if (isGuideRelated) {
        try {
          const aivyResponse = await generateAivyReply([], input.trim())

          const hasHelpLink = aivyResponse.toLowerCase().includes("/help") ||
                             aivyResponse.toLowerCase().includes("trung tâm trợ giúp")

          const aivyMessagesRef = collection(firestore, "supportTickets", activeId, "messages")
          await setDoc(doc(aivyMessagesRef), {
            senderId: "aivy-bot",
            senderName: "Aivy (AI Assistant)",
            content: hasHelpLink
              ? aivyResponse + "\n\n📚 Bạn cũng có thể xem thêm tại: /help"
              : aivyResponse,
            timestamp: serverTimestamp(),
            read: false,
            isAutoReply: true,
          })

          await setDoc(ticketRef, {
            lastMessage: "Aivy đã phản hồi",
            lastMessageAt: serverTimestamp(),
            aivySummary: aivyResponse.slice(0, 200),
          }, { merge: true })
        } catch (err) {
          console.error("Aivy auto-reply error:", err)
        }
      }
    } catch (err) {
      console.error("Error sending message:", err)
      toast.error("Không thể gửi tin nhắn")
    }
  }

  function getStatusLabel(status: SupportTicket["status"]) {
    switch (status) {
      case "pending": return "Chờ xử lý"
      case "in_progress": return "Đang xử lý"
      case "resolved": return "Đã giải quyết"
      case "closed": return "Đã đóng"
    }
  }

  function getStatusColor(status: SupportTicket["status"]) {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700"
      case "in_progress": return "bg-blue-100 text-blue-700"
      case "resolved": return "bg-emerald-100 text-emerald-700"
      case "closed": return "bg-neutral-100 text-neutral-600"
    }
  }

  function getCategoryLabel(category: SupportTicket["category"]) {
    switch (category) {
      case "general": return "Chung"
      case "order": return "Đơn hàng"
      case "payment": return "Thanh toán"
      case "product": return "Sản phẩm"
      case "account": return "Tài khoản"
      case "guide": return "Hướng dẫn"
    }
  }

  if (!user) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <Inbox size={48} className="text-neutral-300" />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">
          Đăng nhập để xem tin nhắn hỗ trợ
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Yêu cầu hỗ trợ của bạn sẽ được đồng bộ theo tài khoản.
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
        {/* Sidebar - Ticket List */}
        <aside
          className={cn(
            "flex flex-col border-r border-neutral-200",
            activeId && "hidden lg:flex"
          )}
        >
          <div className="border-b border-neutral-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Hỗ trợ</h2>
              <button
                onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                className="rounded-lg bg-brand-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red-600"
              >
                + Mới
              </button>
            </div>

            {showNewTicketForm && (
              <div className="mb-3 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Tiêu đề..."
                  className="input w-full text-sm"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportTicket["category"])}
                  className="input w-full text-sm"
                >
                  <option value="general">Chung</option>
                  <option value="order">Đơn hàng</option>
                  <option value="payment">Thanh toán</option>
                  <option value="product">Sản phẩm</option>
                  <option value="account">Tài khoản</option>
                  <option value="guide">Hướng dẫn</option>
                </select>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mô tả vấn đề..."
                  rows={2}
                  className="input w-full text-sm"
                />
                <button
                  onClick={handleCreateTicket}
                  disabled={isCreatingTicket || !subject.trim()}
                  className="btn-primary w-full text-xs"
                >
                  {isCreatingTicket ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            )}

            <div className="relative">
              <HelpCircle
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                placeholder="Tìm ticket..."
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingTickets ? (
              <div className="flex items-center gap-2 p-4 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Đang tải...
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <MessageSquare size={40} className="text-neutral-300" />
                <h3 className="mt-3 text-sm font-bold text-neutral-900">
                  Chưa có yêu cầu nào
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Nhấn "+ Mới" để tạo yêu cầu hỗ trợ.
                </p>
                <Link to="/help" className="mt-3 text-xs font-semibold text-brand-red-600 hover:underline">
                  📚 Xem Trung tâm trợ giúp
                </Link>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setActiveId(ticket.id)}
                  className={cn(
                    "flex w-full flex-col gap-2 border-b border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50",
                    activeId === ticket.id && "bg-brand-red-50"
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-neutral-900">
                      {ticket.subject}
                    </span>
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px]", getStatusColor(ticket.status))}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500">
                      {getCategoryLabel(ticket.category)}
                    </span>
                    {ticket.lastMessageAt && (
                      <span className="text-[10px] text-neutral-400">
                        · {formatRelativeTime(ticket.lastMessageAt.toDate ? ticket.lastMessageAt.toDate() : new Date())}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          
          {/* Quick help links */}
          <div className="border-t border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Trợ giúp nhanh
            </div>
            <div className="space-y-1">
              <Link to="/help" className="flex items-center gap-2 text-xs text-neutral-600 hover:text-brand-red-600">
                <FileText size={12} />
                Trung tâm trợ giúp
              </Link>
              <Link to="/aivy" className="flex items-center gap-2 text-xs text-neutral-600 hover:text-brand-red-600">
                <Sparkles size={12} />
                Hỏi Aivy AI
              </Link>
              <Link to="/contact" className="flex items-center gap-2 text-xs text-neutral-600 hover:text-brand-red-600">
                <MessageSquare size={12} />
                Liên hệ khác
              </Link>
            </div>
          </div>
        </aside>

        {/* Main chat area */}
        <section className={cn("flex flex-col", !activeId && "hidden lg:flex")}>
          {activeId ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveId(null)}
                    className="rounded p-1 hover:bg-neutral-100 lg:hidden"
                    aria-label="Quay lại"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-900">
                        Hỗ trợ ACFMart
                      </span>
                      <Sparkles size={12} className="text-brand-gold-500" />
                    </div>
                    <div className="text-xs text-neutral-500">
                      {tickets.find((t) => t.id === activeId)?.subject}
                    </div>
                  </div>
                </div>
                <span className={cn("rounded-lg px-2 py-1 text-xs font-medium", getStatusColor(tickets.find((t) => t.id === activeId)?.status || "pending"))}>
                  {getStatusLabel(tickets.find((t) => t.id === activeId)?.status || "pending")}
                </span>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4"
              >
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-neutral-500">
                    <Loader2 size={16} className="animate-spin" />
                    Đang tải tin nhắn...
                  </div>
                ) : ticketMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Chưa có tin nhắn. Admin sẽ phản hồi sớm.
                  </div>
                ) : (
                  ticketMessages.map((message: any) => {
                    const fromMe = message.senderId === user?.id
                    const fromAivy = message.senderId === "aivy-bot"
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
                              : fromAivy
                              ? "rounded-bl-md bg-gradient-to-br from-brand-red-50 to-white text-neutral-900 ring-1 ring-brand-red-200"
                              : "rounded-bl-md bg-white text-neutral-900 ring-1 ring-neutral-200"
                          )}
                        >
                          {fromAivy && (
                            <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-brand-red-600">
                              <Sparkles size={10} />
                              Aivy (AI Assistant)
                              {message.isAutoReply && (
                                <span className="rounded bg-brand-red-100 px-1 text-[9px]">Tự động</span>
                              )}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          <div
                            className={cn(
                              "mt-1 text-[10px]",
                              fromMe ? "text-white/70" : "text-neutral-500"
                            )}
                          >
                            {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            {fromMe && " · Đã gửi"}
                            {fromAivy && " · AI"}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Input */}
              <div className="border-t border-neutral-200 bg-white p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Nhập tin nhắn... (Aivy sẽ tự động trả lời các câu hỏi về hướng dẫn)"
                    rows={1}
                    className="max-h-32 flex-1 resize-none rounded-2xl border border-neutral-200 px-4 py-2 text-sm focus:border-brand-red-400 focus:outline-none focus:ring-1 focus:ring-brand-red-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || !activeId}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red-500 text-white transition-colors hover:bg-brand-red-600 disabled:bg-neutral-300"
                    aria-label="Gửi"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <div className="mt-1 text-center text-[10px] text-neutral-400">
                  💡 Mẹo: Với câu hỏi về hướng dẫn, Aivy sẽ tự động trả lời và gửi link đến /help
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-neutral-500">
              Chọn hoặc tạo mới yêu cầu hỗ trợ
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
