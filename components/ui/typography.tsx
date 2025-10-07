import type React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "lead" | "large" | "small" | "muted"
  align?: "left" | "center" | "right"
}

export function Typography({
  children,
  className,
  as: Component = "p",
  variant = "p",
  align = "left",
  ...props
}: TypographyProps) {
  const variantClasses = {
    h1: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight",
    h2: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
    h3: "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",
    h4: "text-lg sm:text-xl md:text-2xl font-bold tracking-tight",
    h5: "text-base sm:text-lg md:text-xl font-bold tracking-tight",
    h6: "text-sm sm:text-base md:text-lg font-bold tracking-tight",
    p: "text-base leading-relaxed",
    lead: "text-lg sm:text-xl leading-relaxed",
    large: "text-lg leading-relaxed",
    small: "text-sm leading-relaxed",
    muted: "text-sm text-gray-500 dark:text-gray-400 leading-relaxed",
  }

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  return (
    <Component className={cn(variantClasses[variant], alignClasses[align], className)} {...props}>
      {children}
    </Component>
  )
}
