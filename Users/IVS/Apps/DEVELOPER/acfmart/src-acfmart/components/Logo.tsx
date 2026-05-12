import { cn } from "../lib/cn";
import logoImg from "../assets/logo.png"; // 确保路径正确

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "compact";
  className?: string;
}

export function Logo({
  size = "md",
  variant = "horizontal",
  className,
}: LogoProps) {
  const sizes = {
    sm: "w-16 h-8",
    md: "w-20 h-10", 
    lg: "w-24 h-12",
  };

  return (
    <img 
      src={logoImg} 
      alt="Biểu tượng ứng dụng" 
      className={cn(sizes[size], className)}
    />
  );
}