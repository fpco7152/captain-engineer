/**
 * Utility functions for performance optimization
 */

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function to limit the rate at which a function can fire
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastFunc: ReturnType<typeof setTimeout> | null = null
  let lastRan = 0

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      lastRan = Date.now()
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
        if (lastFunc) {
          clearTimeout(lastFunc)
          lastFunc = null
        }
      }, limit)
    } else {
      if (lastFunc) clearTimeout(lastFunc)

      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func(...args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan),
      )
    }
  }
}

// Check if device is low-end based on memory and cores
export function isLowEndDevice(): boolean {
  // Check for memory
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return true
  }

  // Check for CPU cores
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true
  }

  return false
}

// Check if the browser supports certain features
export function getBrowserCapabilities() {
  return {
    supportsIntersectionObserver: "IntersectionObserver" in window,
    supportsResizeObserver: "ResizeObserver" in window,
    supportsWebP: false, // Will be updated async
    supportsTouchEvents: "ontouchstart" in window,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    devicePixelRatio: window.devicePixelRatio || 1,
    isLowEndDevice: isLowEndDevice(),
  }
}

// Check WebP support
export async function checkWebPSupport(): Promise<boolean> {
  if (!self.createImageBitmap) return false

  const webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
  const blob = await fetch(webpData).then((r) => r.blob())

  return createImageBitmap(blob).then(
    () => true,
    () => false,
  )
}

// Get optimal image format based on browser support
export async function getOptimalImageFormat(): Promise<"webp" | "avif" | "jpg"> {
  // Check for AVIF support
  const avifData =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK"

  try {
    const avifSupported = await fetch(avifData)
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then(() => true)
      .catch(() => false)

    if (avifSupported) return "avif"
  } catch (e) {
    // Fallback if fetch or createImageBitmap fails
  }

  // Check for WebP support
  const webpSupported = await checkWebPSupport()
  return webpSupported ? "webp" : "jpg"
}

// Measure performance of a function
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  label: string,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()

    console.log(`${label} took ${end - start}ms`)

    return result
  }
}
