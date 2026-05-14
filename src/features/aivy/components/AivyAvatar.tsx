import { cn } from "../../../lib/cn"

interface AivyAvatarProps {
  size?: number
  className?: string
  animate?: boolean
}

export function AivyAvatar({ size = 32, className, animate }: AivyAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-red-500 via-brand-red-600 to-brand-gold-500 font-black text-white shadow-md",
        animate && "animate-pulse-slow",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      <span className="drop-shadow-sm">A</span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
    </div>
  )
}
