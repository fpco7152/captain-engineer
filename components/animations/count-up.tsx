"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  delay?: number
  decimals?: number
  prefix?: string
  suffix?: string
  separator?: string
  className?: string
  once?: boolean
}

export function CountUp({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
  once = true,
}: CountUpProps) {
  const [count, setCount] = useState(start)
  const ref = useRef(null)
  const isInView = useInView(ref, { once })
  const prefersReducedMotion = useReducedMotion()
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || (once && hasAnimated.current) || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setCount(end)
      }
      return
    }

    hasAnimated.current = true
    let startTime: number
    let animationFrame: number

    const startAnimation = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const currentCount = progress * (end - start) + start

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(startAnimation)
      }
    }

    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(startAnimation)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrame)
    }
  }, [isInView, start, end, duration, delay, once, prefersReducedMotion])

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join(".")
  }

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}
