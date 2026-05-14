import { LucideIcon } from "lucide-react"
import { cn } from "../../../lib/cn"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend?: { value: string; positive: boolean }
  color?: "red" | "gold" | "blue" | "emerald"
}

export function StatCard({ icon: Icon, label, value, trend, color = "red" }: StatCardProps) {
  const colors = {
    red: "bg-brand-red-50 text-brand-red-600",
    gold: "bg-brand-gold-50 text-brand-gold-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2", colors[color])}>
          <Icon size={18} />
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
              trend.positive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            )}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-extrabold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  )
}
