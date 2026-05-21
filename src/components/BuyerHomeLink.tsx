import type { MouseEventHandler, ReactNode } from "react"
import { Link } from "react-router-dom"
import { getBuyerHomeHref } from "../lib/domain"

interface BuyerHomeLinkProps {
  children: ReactNode
  className?: string
  ariaLabel?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export function BuyerHomeLink({
  children,
  className,
  ariaLabel = "Trang chủ ACFMart",
  onClick,
}: BuyerHomeLinkProps) {
  const href = getBuyerHomeHref()
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <Link to={href} className={className} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </Link>
  )
}
