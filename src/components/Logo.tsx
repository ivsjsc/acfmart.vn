import { cn } from "../lib/cn"
import logoImg from "../assets/acfmart-logo.jpg"

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
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
  }

  return (
    <img 
      src={logoImg} 
      alt="ACFMart" 
      className={cn(sizes[size], "object-contain", className)}
    />
  )
}
