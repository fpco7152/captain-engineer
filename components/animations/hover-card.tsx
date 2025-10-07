"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HoverCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  hoverElevation?: boolean
  transitionDuration?: number
}

export function HoverCard({
  children,
  className,
  hoverScale = 1.02,
  hoverElevation = true,
  transitionDuration = 0.2,
}: HoverCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(className, hoverElevation && "relative z-10")}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: hoverScale,
              boxShadow: hoverElevation
                ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                : undefined,
            }
      }
      transition={{ duration: transitionDuration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
