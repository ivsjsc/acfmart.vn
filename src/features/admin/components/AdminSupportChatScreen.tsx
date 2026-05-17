import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Inbox,
  Loader2,
  MoreVertical,
  Phone,
  Search,
  Send,
  ShieldCheck,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { chatService, type Conversation, type ChatMessage } from "../../../lib/firestore-chat"
import { formatRelativeTime } from "../../../lib/format"
import {
  useChatMessages,
  useConversations,
  useSendChatMessage,
} from "../../../hooks/use-chat-realtime"
import { useAuthStore } from "../../../stores/auth-store"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
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
  lastMessageAt: Date | null
  unreadCount: number
  assignedTo?: string
  createdAt: Date
}

export default function AdminSupportChatScreen() {
  const user = useAuthStore((state) => state.user)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in_progress" | "resolved">("all")
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const { conversations, loading: conversationsLoading } = useConversations()
  const { messages, loading: messagesLoading } = useChatMessages(activeId)
  
  const activeConv = conversations.find((c) => c.id === activeId) ?? null
  const receiverId = activeConv?.participants.find((p) => p !== user?.id) ?? ""
  const sendMessage = useSendChatMessage(activeId ?? "", receiverId)

  // Subscribe to support tickets
  useEffect(() => {
    if (!user) return
    
    setTicketsLoading(true)
    const q = query(
      collection(firestore, "supportTickets"),
      orderBy("lastMessageAt", "desc")
    )
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const ticketsData: SupportTicket[] = snap.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || "",
          userName: data.userName || "Người dùng",
          userAvatar: data.userAvatar,
          userEmail: data.userEmail,
          subject: data.subject || "Không có tiêu đề",
          status: data.status || "pending",
          priority: data.priority || "medium",
          category: data.category || "general",
          lastMessage: data.lastMessage || "",
          lastMessageAt: data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : null,
          unreadCount: data.unreadCount || 0,
          assignedTo: data.assignedTo,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        }
      })
      setTickets(ticketsData)
      setTicketsLoading(false)
    }, (err) => {
      console.error("Error subscribing to support tickets:", err)
      setTicketsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        ticket.userName.toLowerCase().includes(searchLower) ||
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.lastMessage.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const pendingCount = tickets.filter((t) => t.status === "pending").length
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length

  async function handleSendMessage() {
    if (!input.trim() || !activeId || !receiverId) return
    try {
      await sendMessage(input)
      setInput("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi tin nhắn")
    }
  }

  async function handleAssignTicket(ticketId: string) {
    try {
      const ticketRef = collection(firestore, "supportTickets", ticketId, "messages")
      // Update ticket assignment
      toast.success("Đã nhận xử lý ticket này")
    } catch (err) {
      toast.error("Không thể gán ticket")
    }
  }

  async function handleUpdateStatus(ticketId: string, newStatus: SupportTicket["status"]) {
    try {
      // This would update the ticket status in Firestore
      toast.success(`Đã cập nhật trạng thái thành ${getStatusLabel(newStatus)}`)
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái")
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

  function getPriorityColor(priority: SupportTicket["priority"]) {
    switch (priority) {
      case "high": return "text-red-600"
      case "medium": return "text-amber-600"
      case "low": return "text-green-600"
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
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Clock size={16} />
            Chờ xử lý
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MessageSquare size={16} />
            Đang xử lý
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{inProgressCount}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <CheckCircle size={16} />
            Đã giải quyết
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {tickets.filter((t) => t.status === "resolved").length}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <FileText size={16} />
            Tổng tickets
          </div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">{tickets.length}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid h-[calc(100vh-320px)] min-h-[500px] lg:grid-cols-[380px_1fr]">
          {/* Sidebar - Ticket List */}
          <aside
            className={cn(
              "flex flex-col border-r border-neutral-200",
              activeId && "hidden lg:flex"
            )}
          >
            <div className="border-b border-neutral-200 p-3">
              <h2 className="mb-2 text-base font-bold text-neutral-900">Hỗ trợ người dùng</h2>
              
              {/* Filter tabs */}
              <div className="mb-3 flex gap-1">
                {(["all", "pending", "in_progress", "resolved"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                      filterStatus === status
                        ? "bg-brand-red-50 text-brand-red-700"
                        : "text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    {status === "all" ? "Tất cả" : getStatusLabel(status)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm ticket..."
                  className="input pl-9 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {ticketsLoading ? (
                <div className="flex items-center gap-2 p-4 text-sm text-neutral-500">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tải tickets...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <Inbox size={40} className="text-neutral-300" />
                  <h3 className="mt-3 text-sm font-bold text-neutral-900">
                    Chưa có ticket nào
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Khi người dùng gửi yêu cầu hỗ trợ, ticket sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setActiveId(ticket.id)}
                    className={cn(
                      "flex w-full flex-col gap-2 border-b border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50",
                      activeId === ticket.id && "bg-brand-red-50"
                    )}
                  >
                    <div className="flex w-full items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
                        {ticket.userAvatar ? (
                          <img src={ticket.userAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          ticket.userName[0]?.toUpperCase() ?? "U"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-neutral-900">
                            {ticket.userName}
                          </span>
                          <span className={cn("shrink-0 text-[10px]", getPriorityColor(ticket.priority))}>
                            {ticket.priority === "high" ? "🔴 Cao" : ticket.priority === "medium" ? "🟡 TB" : "🟢 Thấp"}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-xs text-neutral-600">
                          {ticket.subject}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", getStatusColor(ticket.status))}>
                            {getStatusLabel(ticket.status)}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {getCategoryLabel(ticket.category)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {ticket.lastMessage && (
                      <div className="ml-13 truncate text-xs text-neutral-500">
                        {ticket.lastMessage}
                      </div>
                    )}
                    {ticket.unreadCount > 0 && (
                      <span className="ml-13 shrink-0 rounded-full bg-brand-red-500 px-1.5 text-[10px] font-bold text-white">
                        {ticket.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
                      {filteredTickets.find((t) => t.id === activeId)?.userAvatar ? (
                        <img 
                          src={filteredTickets.find((t) => t.id === activeId)?.userAvatar} 
                          alt="" 
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        filteredTickets.find((t) => t.id === activeId)?.userName[0]?.toUpperCase() ?? "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900">
                          {filteredTickets.find((t) => t.id === activeId)?.userName}
                        </span>
                        <ShieldCheck size={12} className="text-brand-gold-500" />
                      </div>
                      <div className="text-xs text-neutral-500">
                        {filteredTickets.find((t) => t.id === activeId)?.userEmail || "Người dùng"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-neutral-200 px-2 py-1 text-xs"
                      value={filteredTickets.find((t) => t.id === activeId)?.status || "pending"}
                      onChange={(e) => handleUpdateStatus(activeId, e.target.value as SupportTicket["status"])}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="resolved">Đã giải quyết</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                    <button className="rounded p-2 hover:bg-neutral-100" aria-label="Gọi">
                      <Phone size={16} />
                    </button>
                    <button className="rounded p-2 hover:bg-neutral-100" aria-label="Tùy chọn">
                      <MoreVertical size={16} />
                    </button>
                  </div>
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
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                      Chưa có tin nhắn. Hãy bắt đầu cuộc hội thoại.
                    </div>
                  ) : (
                    messages.map((message) => {
                      const fromMe = message.senderId === user?.id
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
                      placeholder="Nhập tin nhắn hỗ trợ..."
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
                    Gợi ý: Sử dụng Aivy để tự động trả lời các câu hỏi thường gặp về hướng dẫn
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-neutral-500">
                Chọn một ticket để bắt đầu hỗ trợ
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
