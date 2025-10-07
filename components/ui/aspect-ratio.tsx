import type React from "react"
import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  ratio?: number
}

export function AspectRatio({ children, className, ratio = 16 / 9, ...props }: AspectRatioProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
