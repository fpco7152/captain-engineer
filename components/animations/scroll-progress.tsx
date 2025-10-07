"use client"

import { motion, useScroll } from "framer-motion"
import { useReducedMotion } from "framer-motion"

interface ScrollProgressProps {
  color?: string
  height?: number
  zIndex?: number
}

export function ScrollProgress({ color = "#F59E0B", height = 3, zIndex = 50 }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0"
      style={{
        height,
        background: color,
        transformOrigin: "0%",
        scaleX: scrollYProgress,
        zIndex,
      }}
    />
  )
}
