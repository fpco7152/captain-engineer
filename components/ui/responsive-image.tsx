"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getImageProps, getResponsiveSizes, type OptimizedImageProps } from "@/utils/image-utils"

interface ResponsiveImageProps extends OptimizedImageProps {
  aspectRatio?: "auto" | "square" | "video" | "portrait" | "wide" | number
  fill?: boolean
  containerClassName?: string
  animation?: "fade" | "zoom" | "none"
}

export function ResponsiveImage({
  aspectRatio = "auto",
  fill = false,
  containerClassName,
  animation = "none",
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imageProps = getImageProps(props)

  // Set default sizes if not provided
  if (!imageProps.sizes) {
    imageProps.sizes = getResponsiveSizes(fill ? "full" : "card")
  }

  // Calculate aspect ratio
  let paddingBottom: string | undefined
  if (!fill && aspectRatio !== "auto") {
    if (aspectRatio === "square") {
      paddingBottom = "100%"
    } else if (aspectRatio === "video") {
      paddingBottom = "56.25%" // 16:9
    } else if (aspectRatio === "portrait") {
      paddingBottom = "150%" // 2:3
    } else if (aspectRatio === "wide") {
      paddingBottom = "42.85%" // 21:9
    } else if (typeof aspectRatio === "number") {
      paddingBottom = `${(1 / aspectRatio) * 100}%`
    }
  }

  // Animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } },
    },
    zoom: {
      hidden: { opacity: 0, scale: 1.1 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    },
    none: {
      hidden: {},
      visible: {},
    },
  }

  return (
    <div
      className={cn("overflow-hidden", fill ? "relative w-full h-full" : "relative w-full", containerClassName)}
      style={!fill && paddingBottom ? { paddingBottom } : undefined}
    >
      <motion.div
        className="h-full w-full"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={variants[animation]}
      >
        <Image
          {...imageProps}
          className={cn(
            "transition-all duration-300",
            fill ? "object-cover" : "w-full h-auto",
            !isLoaded && "scale-105 blur-sm",
            imageProps.className,
          )}
          fill={fill}
          onLoad={() => setIsLoaded(true)}
        />
      </motion.div>
    </div>
  )
}
