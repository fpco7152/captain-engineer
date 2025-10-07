"use client"

import { useState, useEffect, useRef } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fadeIn?: boolean
  lazyOffset?: number
  placeholderColor?: string
  lowQualityPlaceholder?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className,
  fadeIn = true,
  lazyOffset = 200,
  placeholderColor = "#f3f4f6",
  lowQualityPlaceholder = false,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!imageRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: `${lazyOffset}px`,
      },
    )

    observer.observe(imageRef.current)

    return () => {
      observer.disconnect()
    }
  }, [lazyOffset])

  // Generate a low-quality placeholder URL if needed
  const placeholderUrl = lowQualityPlaceholder ? (typeof src === "string" ? `${src}?w=20&q=10` : undefined) : undefined

  return (
    <div
      ref={imageRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundColor: placeholderColor,
      }}
    >
      {(isVisible || props.priority) && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          className={cn(fadeIn && "transition-opacity duration-500", isLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setIsLoaded(true)}
          placeholder={lowQualityPlaceholder ? "blur" : "empty"}
          blurDataURL={placeholderUrl}
          {...props}
        />
      )}
    </div>
  )
}
