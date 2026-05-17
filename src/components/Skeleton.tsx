import { cn } from "../lib/cn"

export interface SkeletonProps {
  className?: string
  rounded?: "none" | "sm" | "md" | "lg" | "full"
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const radiusClass =
    rounded === "none"
      ? ""
      : rounded === "sm"
        ? "rounded-sm"
        : rounded === "lg"
          ? "rounded-lg"
          : rounded === "full"
            ? "rounded-full"
            : "rounded-md"
  return (
    <div
      className={cn("animate-pulse bg-neutral-200/80", radiusClass, className)}
      aria-hidden="true"
    />
  )
}

/** Card-shape skeleton for product/voucher grids. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <Skeleton className="h-40 w-full" rounded="none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

/** Horizontal row skeleton — for table rows / list items. */
export function RowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3", className)}>
      <Skeleton className="h-12 w-12" rounded="lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-7 w-16" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function VoucherListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        >
          <Skeleton className="h-24 w-28" rounded="none" />
          <div className="flex-1 space-y-2 p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
