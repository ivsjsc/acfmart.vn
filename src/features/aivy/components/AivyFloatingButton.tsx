import { useEffect } from "react"
import { useAivyStore } from "../aivy-store"
import { AivyChatPanel } from "./AivyChatPanel"
import { AivyAvatar } from "./AivyAvatar"
import { Sparkles, X } from "lucide-react"
import { cn } from "../../../lib/cn"

export function AivyFloatingButton() {
  const isOpen = useAivyStore((s) => s.isOpen)
  const toggle = useAivyStore((s) => s.toggle)
  const close = useAivyStore((s) => s.close)
  const messageCount = useAivyStore((s) => s.messages.length)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, close])

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggle}
        className={cn(
          "group fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-red-500 via-brand-red-600 to-brand-gold-500 px-4 py-3 text-white shadow-xl ring-2 ring-white transition-all hover:scale-105 lg:bottom-6 lg:right-6",
          isOpen && "scale-90 opacity-0 pointer-events-none"
        )}
        aria-label="Mở chat Aivy"
      >
        <div className="relative">
          <AivyAvatar size={32} animate />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="flex items-center gap-1 text-sm font-bold">
            Aivy
            <Sparkles size={10} className="text-brand-gold-200" />
          </span>
          <span className="text-[10px] text-white/90">Hỏi tôi bất cứ điều gì</span>
        </div>
        {messageCount > 1 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold ring-2 ring-white">
            {Math.min(messageCount - 1, 99)}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <>
          {/* Backdrop mobile */}
          <button
            onClick={close}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            aria-label="Đóng chat"
          />

          {/* Panel */}
          <div
            className={cn(
              "fixed z-50 animate-slide-up",
              // Mobile: bottom sheet full width
              "inset-x-0 bottom-0 top-16 md:inset-auto",
              // Desktop: floating bottom-right
              "md:bottom-6 md:right-6 md:h-[600px] md:w-96"
            )}
          >
            <AivyChatPanel onClose={close} />
          </div>
        </>
      )}
    </>
  )
}
