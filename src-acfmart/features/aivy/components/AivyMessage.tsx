import { cn } from "../../../lib/cn"
import { AivyAvatar } from "./AivyAvatar"
import type { AivyMessage as AivyMessageType } from "../types"
import { AlertCircle } from "lucide-react"

interface AivyMessageProps {
  message: AivyMessageType
}

export function AivyMessage({ message }: AivyMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex animate-slide-up gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && <AivyAvatar size={28} />}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-brand-red-500 text-white"
            : "rounded-bl-md bg-white text-neutral-900 ring-1 ring-neutral-200"
        )}
      >
        {message.error ? (
          <div className="flex items-start gap-2 text-brand-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{message.error}</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && (
              <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-current align-middle" />
            )}
          </div>
        )}
        <div
          className={cn(
            "mt-1 text-[10px] opacity-60",
            isUser ? "text-right" : "text-left"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}
