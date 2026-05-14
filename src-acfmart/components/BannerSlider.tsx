import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../lib/cn"
import { getAllBanners, type BannerItem } from "../lib/banner-service"

interface BannerSliderProps {
  autoPlayInterval?: number
  className?: string
}

export function BannerSlider({
  autoPlayInterval = 5000,
  className,
}: BannerSliderProps) {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getAllBanners()
      .then((items) => {
        setBanners(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(next, autoPlayInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [banners.length, next, autoPlayInterval])

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(next, autoPlayInterval)
  }

  if (loading) {
    return (
      <div className={cn("aspect-[2.5/1] w-full animate-pulse rounded-2xl bg-neutral-100", className)} />
    )
  }

  if (banners.length === 0) return null

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl", className)}>
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.link_url || "#"}
            className="block w-full shrink-0"
            target={banner.link_url?.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
          >
            <div className="relative aspect-[2.5/1] w-full">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 md:p-6">
                  <p className="text-sm font-semibold text-white md:text-base lg:text-lg">
                    {banner.title}
                  </p>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => { prev(); resetTimer() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-white md:left-4 md:p-2"
            aria-label="Previous"
          >
            <ChevronLeft size={18} className="text-neutral-700" />
          </button>
          <button
            onClick={() => { next(); resetTimer() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-white md:right-4 md:p-2"
            aria-label="Next"
          >
            <ChevronRight size={18} className="text-neutral-700" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); resetTimer() }}
              className={cn(
                "h-2 rounded-full transition-all",
                current === i
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
