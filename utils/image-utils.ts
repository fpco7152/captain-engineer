import type { StaticImageData } from "next/image"

export type ImageSource = string | StaticImageData

export interface OptimizedImageProps {
  src: ImageSource
  alt: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty" | "data:image/..."
  className?: string
}

export const getResponsiveSizes = (type: "hero" | "card" | "thumbnail" | "full" | "banner" = "card"): string => {
  switch (type) {
    case "hero":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
    case "card":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    case "thumbnail":
      return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    case "banner":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
    case "full":
    default:
      return "100vw"
  }
}

export const getImageProps = (
  props: OptimizedImageProps,
): {
  src: ImageSource
  alt: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty" | "data:image/..."
  className?: string
} => {
  return {
    src: props.src,
    alt: props.alt || "",
    width: props.width,
    height: props.height,
    sizes: props.sizes,
    priority: props.priority || false,
    quality: props.quality || 85,
    placeholder: props.placeholder || "empty",
    className: props.className || "object-cover",
  }
}
