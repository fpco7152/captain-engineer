"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

interface HoverButtonProps extends ButtonProps {
  children: React.ReactNode
  className?: string
  hoverEffect?: "scale" | "lift" | "glow" | "ripple" | "shine" | "none"
  rippleColor?: string
}

export function HoverButton({
  children,
  className,
  hoverEffect = "scale",
  rippleColor = "rgba(255, 255, 255, 0.7)",
  ...props
}: HoverButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  // Handle ripple effect
  const handleRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverEffect !== "ripple") return

    const button = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - button.left
    const y = e.clientY - button.top

    const newRipple = {
      x,
      y,
      id: Date.now(),
    }

    setRipples([...ripples, newRipple])

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 1000)
  }

  const getHoverAnimation = () => {
    if (prefersReducedMotion) return {}

    switch (hoverEffect) {
      case "scale":
        return { scale: 1.05 }
      case "lift":
        return { y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }
      case "glow":
        return { boxShadow: "0 0 15px 2px rgba(245, 158, 11, 0.6)" }
      case "shine":
        return {
          backgroundPosition: ["200% 0", "0% 0"],
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          backgroundSize: "200% 100%",
          transition: { duration: 1.2 },
        }
      default:
        return {}
    }
  }

  return (
    <motion.div
      whileHover={getHoverAnimation()}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={handleRipple}
      className="relative overflow-hidden inline-block"
    >
      <Button className={cn("text-white", className)} {...props}>
        {children}
      </Button>

      {/* Ripple effect */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute",
            top: ripple.y,
            left: ripple.x,
            transform: "translate(-50%, -50%)",
            backgroundColor: rippleColor,
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            pointerEvents: "none",
          }}
        />
      ))}
    </motion.div>
  )
}
