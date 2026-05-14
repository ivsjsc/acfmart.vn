import { useEffect, useRef, useState } from "react"
import { Send, X, RefreshCw, Sparkles, Loader2 } from "lucide-react"
import { useAivyStore } from "../aivy-store"
import { generateAivyReply } from "../gemini-service"
import { AIVY_QUICK_PROMPTS } from "../system-prompt"
import { AivyAvatar } from "./AivyAvatar"
import { AivyMessage } from "./AivyMessage"
import { cn } from "../../../lib/cn"
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
  const clearConversation = useAivyStore((s) => s.clearConversation)

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length, isLoading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

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
      const reply = await generateAivyReply(historyBeforeUser, trimmed)
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
          <div className="text-[11px] text-white/80">
            Trợ lý AI (nữ) · Đang trực tuyến
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Xoá lịch sử trò chuyện với Aivy?")) clearConversation()
          }}
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
            placeholder="Hỏi Aivy về sản phẩm chính hãng, QR, đơn hàng..."
            rows={1}
            disabled={isLoading}
            className="max-h-32 flex-1 resize-none border-0 bg-transparent text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
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
          Aivy có thể mắc lỗi · Phát triển bởi{" "}
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
