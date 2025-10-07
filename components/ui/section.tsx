import type React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  containerSize?: "sm" | "md" | "lg" | "xl" | "full"
  containerClassName?: string
  as?: React.ElementType
}

export function Section({
  children,
  className,
  containerSize = "lg",
  containerClassName,
  as: Component = "section",
  ...props
}: SectionProps) {
  return (
    <Component className={cn("py-8 sm:py-12 md:py-16 lg:py-20", className)} {...props}>
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </Component>
  )
}
