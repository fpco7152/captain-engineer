"use client"

import { useState, useEffect, useRef } from "react"

interface UseIntersectionObserverProps {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<Element | null>(null)
  const frozen = useRef(false)

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)

    const isIntersecting = entry.isIntersecting

    if (isIntersecting) {
      setIsVisible(true)

      if (freezeOnceVisible) {
        frozen.current = true
      }
    } else if (!freezeOnceVisible || !frozen.current) {
      setIsVisible(false)
    }
  }

  useEffect(() => {
    const node = elementRef.current

    // Early return if no element or browser doesn't support IntersectionObserver
    if (!node || typeof IntersectionObserver !== "function") {
      setIsVisible(true) // Fallback to always visible
      return
    }

    // Skip observation if already frozen
    if (freezeOnceVisible && frozen.current) return

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return { ref: elementRef, entry, isVisible }
}
