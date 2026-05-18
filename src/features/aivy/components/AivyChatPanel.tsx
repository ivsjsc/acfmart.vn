import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Send, X, RefreshCw, Sparkles, Loader2 } from "lucide-react"
import { useAivyStore } from "../aivy-store"
import { generateAivyResponse } from "../aivy-core"
import { buildAivyRuntimeContext } from "../aivy-context"
import {
  clearLocalAivyHistory,
  clearRemoteAivyHistory,
  loadRemoteAivyHistory,
  readLocalAivyHistory,
  saveRemoteAivyHistory,
  writeLocalAivyHistory,
} from "../aivy-history-service"
import { AIVY_QUICK_PROMPTS } from "../system-prompt"
import { AivyAvatar } from "./AivyAvatar"
import { AivyMessage } from "./AivyMessage"
import { cn } from "../../../lib/cn"
import { useAuthStore } from "../../../stores/auth-store"
import toast from "react-hot-toast"

interface AivyChatPanelProps {
  embedded?: boolean
  onClose?: () => void
}

export function AivyChatPanel({ embedded, onClose }: AivyChatPanelProps) {
  const messages = useAivyStore((s) => s.messages)
  const isLoading = useAivyStore((s) => s.isLoading)
  const addMessage = useAivyStore((s) => s.addMessage)
  const updateMessage = useAivyStore((s) => s.updateMessage)
  const setLoading = useAivyStore((s) => s.setLoading)
  const setMessages = useAivyStore((s) => s.setMessages)
  const clearConversation = useAivyStore((s) => s.clearConversation)
  const user = useAuthStore((s) => s.user)

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const historyReadyUserRef = useRef<string | null>(null)
  const pendingHydrationUserRef = useRef<string | null>(null)
  const hydrationSkipCountRef = useRef(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length, isLoading])

  useEffect(() => {
    const userId = user?.id
    let cancelled = false
    historyReadyUserRef.current = null
    pendingHydrationUserRef.current = null
    hydrationSkipCountRef.current = 0

    if (!userId) {
      pendingHydrationUserRef.current = null
      hydrationSkipCountRef.current = 0
      setMessages([])
      return () => {
        cancelled = true
      }
    }

    const localMessages = readLocalAivyHistory(userId)
    if (localMessages.length > 0) {
      pendingHydrationUserRef.current = userId
      hydrationSkipCountRef.current = 2
      setMessages(localMessages)
      return () => {
        cancelled = true
      }
    }

    pendingHydrationUserRef.current = userId
    hydrationSkipCountRef.current = 2
    setMessages([])
    loadRemoteAivyHistory(userId)
      .then((remoteMessages) => {
        if (cancelled) return
        pendingHydrationUserRef.current = userId
        hydrationSkipCountRef.current = 1
        setMessages(remoteMessages)
        if (remoteMessages.length > 0) {
          writeLocalAivyHistory(userId, remoteMessages)
        }
      })
      .catch((err) => {
        console.warn("[Aivy] Không tải được lịch sử Firestore:", err)
      })
      .finally(() => {
        if (!cancelled && pendingHydrationUserRef.current !== userId) {
          historyReadyUserRef.current = userId
        }
      })

    return () => {
      cancelled = true
    }
  }, [setMessages, user?.id])

  useEffect(() => {
    const userId = user?.id
    if (!userId) return
    if (pendingHydrationUserRef.current === userId) {
      hydrationSkipCountRef.current -= 1
      if (hydrationSkipCountRef.current <= 0) {
        pendingHydrationUserRef.current = null
        historyReadyUserRef.current = userId
      }
      return
    }
    if (historyReadyUserRef.current !== userId) return

    writeLocalAivyHistory(userId, messages)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveRemoteAivyHistory(userId, messages).catch((err) => {
        console.warn("[Aivy] Không lưu được lịch sử Firestore:", err)
      })
    }, 600)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [messages, user?.id])

  async function handleClearConversation() {
    if (!confirm("Xoá lịch sử trò chuyện với Aivy?")) return
    const userId = user?.id
    if (userId) {
      clearLocalAivyHistory(userId)
      clearRemoteAivyHistory(userId).catch((err) => {
        console.warn("[Aivy] Không xoá được lịch sử Firestore:", err)
      })
      historyReadyUserRef.current = userId
    }
    clearConversation()
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    if (!user) {
      toast.error("Bạn cần đăng nhập để sử dụng Aivy")
      return
    }

    addMessage({ role: "user", content: trimmed })
    setInput("")
    setLoading(true)

    const placeholderMsg = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    })

    try {
      const historyBeforeUser = messages.filter((m) => m.role !== "system")
      const context = await buildAivyRuntimeContext({ user, message: trimmed })
      if (context.directReply) {
        updateMessage(placeholderMsg.id, {
          content: context.directReply,
          isStreaming: false,
        })
        return
      }
      const reply = await generateAivyResponse(historyBeforeUser, trimmed, {
        context: context.text,
      })
      updateMessage(placeholderMsg.id, {
        content: reply,
        isStreaming: false,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Aivy gặp lỗi không xác định"
      updateMessage(placeholderMsg.id, {
        content: "",
        isStreaming: false,
        error: message,
      })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-neutral-50",
        !embedded && "rounded-2xl shadow-2xl ring-1 ring-black/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-gradient-to-r from-brand-red-600 to-brand-red-500 px-4 py-3 text-white">
        <AivyAvatar size={36} />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold">Aivy</span>
            <Sparkles size={12} className="text-brand-gold-300" />
          </div>
          <div className="text-[11px] text-white/80">Thuộc sở hữu IVS JSC</div>
        </div>
        <button
          onClick={handleClearConversation}
          className="rounded-full p-1.5 hover:bg-white/10"
          title="Xoá hội thoại"
          aria-label="Xoá hội thoại"
        >
          <RefreshCw size={16} />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10"
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {!user && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Bạn cần đăng nhập để sử dụng Aivy.
            <Link to="/login" className="ml-1 font-semibold underline">
              Đăng nhập
            </Link>
          </div>
        )}
        {messages.map((m) => (
          <AivyMessage key={m.id} message={m} />
        ))}
        {isLoading &&
          messages[messages.length - 1]?.role === "assistant" &&
          !messages[messages.length - 1]?.content && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <AivyAvatar size={28} />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-2 ring-1 ring-neutral-200">
                <Loader2 size={14} className="animate-spin text-brand-red-500" />
                <span>Aivy đang soạn câu trả lời...</span>
              </div>
            </div>
          )}
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && !isLoading && (
        <div className="border-t border-neutral-200 bg-white px-3 py-2">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Câu hỏi gợi ý
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AIVY_QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={!user}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-200 bg-white px-3 py-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-brand-red-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-red-400">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Hỏi Aivy ngắn gọn về đơn hàng, QR, chính sách..." : "Đăng nhập để sử dụng Aivy"}
            rows={1}
            disabled={isLoading || !user}
            className="max-h-32 flex-1 resize-none border-0 bg-transparent text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !user}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red-500 text-white transition-colors hover:bg-brand-red-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
            aria-label="Gửi"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <div className="mt-1.5 text-center text-[10px] text-neutral-400">
          Aivy thuộc sở hữu{" "}
          <a
            href="https://ivsacademy.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-neutral-500 hover:underline"
          >
            IVS JSC
          </a>
        </div>
      </form>
    </div>
  )
}
