import type React from "react"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  cols?: number
  smCols?: number
  mdCols?: number
  lgCols?: number
  xlCols?: number
  gap?: number
  smGap?: number
  mdGap?: number
  lgGap?: number
  xlGap?: number
}

export function Grid({
  children,
  className,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  gap = 4,
  smGap,
  mdGap,
  lgGap,
  xlGap,
  ...props
}: GridProps) {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  }

  const gapClasses = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
    16: "gap-16",
  }

  return (
    <div
      className={cn(
        "grid",
        colsClasses[cols as keyof typeof colsClasses],
        smCols && `sm:${colsClasses[smCols as keyof typeof colsClasses]}`,
        mdCols && `md:${colsClasses[mdCols as keyof typeof colsClasses]}`,
        lgCols && `lg:${colsClasses[lgCols as keyof typeof colsClasses]}`,
        xlCols && `xl:${colsClasses[xlCols as keyof typeof colsClasses]}`,
        gapClasses[gap as keyof typeof gapClasses],
        smGap && `sm:${gapClasses[smGap as keyof typeof gapClasses]}`,
        mdGap && `md:${gapClasses[mdGap as keyof typeof gapClasses]}`,
        lgGap && `lg:${gapClasses[lgGap as keyof typeof gapClasses]}`,
        xlGap && `xl:${gapClasses[xlGap as keyof typeof gapClasses]}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
