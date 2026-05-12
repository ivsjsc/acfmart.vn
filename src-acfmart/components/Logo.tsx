import { cn } from "../lib/cn"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "horizontal" | "compact"
  className?: string
}

export function Logo({
  size = "md",
  variant = "horizontal",
  className,
}: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-base" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  }
  const s = sizes[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-red-500 to-brand-red-700 font-black text-white shadow-md"
        style={{ width: s.icon, height: s.icon, fontSize: s.icon * 0.42 }}
        aria-hidden
      >
        ACF
      </div>
      {variant === "horizontal" && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-extrabold text-brand-red-600", s.text)}>
            ACFMart
          </span>
          <span className="text-[10px] font-medium text-neutral-500">
            Chống hàng giả
          </span>
        </div>
      )}
    </div>
  )
}
