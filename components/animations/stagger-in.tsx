"use client"

import React from "react"

import { motion } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggerInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  once?: boolean
  threshold?: number
}

export function StaggerIn({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  duration = 0.5,
  direction = "up",
  distance = 20,
  once = true,
  threshold = 0.1,
}: StaggerInProps) {
  const prefersReducedMotion = useReducedMotion()

  const getDirectionOffset = () => {
    if (prefersReducedMotion) return {}

    switch (direction) {
      case "up":
        return { y: distance }
      case "down":
        return { y: -distance }
      case "left":
        return { x: distance }
      case "right":
        return { x: -distance }
      default:
        return {}
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      ...getDirectionOffset(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1.0], // Smooth easing
      },
    },
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, threshold }}
      variants={prefersReducedMotion ? {} : containerVariants}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={prefersReducedMotion ? {} : itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
