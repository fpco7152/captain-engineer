"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReducedMotion } from "framer-motion"

type AnimationType = "fade" | "slide" | "zoom" | "flip" | "none"

interface ImageSliderProps {
  images: {
    src: string
    alt: string
  }[]
  autoPlayInterval?: number
  className?: string
  height?: string
  overlay?: "gradient" | "dark" | "pattern" | "none"
  animation?: AnimationType
  animationDuration?: number
  indicatorType?: "line" | "dot" | "number" | "thumbnail"
  priority?: boolean
  quality?: number
}

export function ImageSlider({
  images,
  autoPlayInterval = 5000,
  className = "",
  height = "h-[600px] md:h-[700px] lg:h-[800px]",
  overlay = "gradient",
  animation = "slide",
  animationDuration = 700,
  indicatorType = "line",
  priority = true,
  quality = 85,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev">("next")
  const [isVisible, setIsVisible] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Use a simpler animation if user prefers reduced motion
  const effectiveAnimation = prefersReducedMotion ? "fade" : animation

  // Get overlay class based on type
  const getOverlayClass = () => {
    switch (overlay) {
      case "gradient":
        return "bg-gradient-to-b from-black/40 via-black/30 to-black/60"
      case "dark":
        return "bg-black/50"
      case "pattern":
        return "bg-black/40 [mask-image:url('/images/pattern.png')] [mask-size:30px]"
      case "none":
      default:
        return ""
    }
  }

  // Optimized slide transition with requestAnimationFrame
  const transitionSlide = useCallback(
    (direction: "next" | "prev", targetIndex: number) => {
      if (isTransitioning) return

      setIsTransitioning(true)
      setTransitionDirection(direction)
      setPrevIndex(currentIndex)
      setCurrentIndex(targetIndex)

      // Use requestAnimationFrame for smoother animation timing
      requestAnimationFrame(() => {
        const cleanup = () => {
          setIsTransitioning(false)
        }

        // Use setTimeout as a fallback, but with RAF for better timing
        const timeoutId = setTimeout(cleanup, animationDuration)

        return () => clearTimeout(timeoutId)
      })
    },
    [currentIndex, isTransitioning, animationDuration],
  )

  const nextSlide = useCallback(() => {
    const targetIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    transitionSlide("next", targetIndex)
  }, [currentIndex, images.length, transitionSlide])

  const prevSlide = useCallback(() => {
    const targetIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    transitionSlide("prev", targetIndex)
  }, [currentIndex, images.length, transitionSlide])

  // Go to a specific slide
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return

      const direction = index > currentIndex ? "next" : "prev"
      transitionSlide(direction, index)
    },
    [currentIndex, isTransitioning, transitionSlide],
  )

  // Optimized touch handlers with passive option for better performance
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (touchStart - touchEnd > 50) {
      // Swipe left, go to next slide
      nextSlide()
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right, go to previous slide
      prevSlide()
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide])

  // Handle mouse enter/leave for pausing autoplay
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (document.activeElement !== sliderRef.current) return

      if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      }
    },
    [prevSlide, nextSlide],
  )

  // Intersection Observer for visibility detection
  useEffect(() => {
    if (!sliderRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(sliderRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Set up autoplay with visibility and pause checks
  useEffect(() => {
    if (isPaused || !isVisible) return

    timerRef.current = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [nextSlide, autoPlayInterval, isPaused, isVisible])

  // Set up keyboard navigation
  useEffect(() => {
    sliderRef.current?.addEventListener("keydown", handleKeyDown)

    return () => {
      sliderRef.current?.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  if (!images || images.length === 0) {
    return null
  }

  // Get animation classes based on animation type and transition direction
  const getAnimationClasses = (index: number) => {
    // Base classes for current and non-current slides
    const baseCurrentClasses = "opacity-100 z-20"
    const baseNonCurrentClasses = "opacity-0 z-10"

    // If not transitioning, just show/hide based on current index
    if (!isTransitioning) {
      return index === currentIndex ? baseCurrentClasses : baseNonCurrentClasses
    }

    // During transition, apply animation based on type
    if (index === currentIndex) {
      // Entering slide
      switch (effectiveAnimation) {
        case "fade":
          return `${baseCurrentClasses} animate-in fade-in duration-${animationDuration}`
        case "slide":
          return `${baseCurrentClasses} animate-in ${
            transitionDirection === "next" ? "slide-in-from-right" : "slide-in-from-left"
          } duration-${animationDuration}`
        case "zoom":
          return `${baseCurrentClasses} animate-in zoom-in-95 duration-${animationDuration}`
        case "flip":
          return `${baseCurrentClasses} animate-in spin-in-${
            transitionDirection === "next" ? "90" : "-90"
          } duration-${animationDuration}`
        case "none":
        default:
          return baseCurrentClasses
      }
    } else if (index === prevIndex) {
      // Exiting slide
      switch (effectiveAnimation) {
        case "fade":
          return `${baseNonCurrentClasses} animate-out fade-out duration-${animationDuration}`
        case "slide":
          return `${baseNonCurrentClasses} animate-out ${
            transitionDirection === "next" ? "slide-out-to-left" : "slide-out-to-right"
          } duration-${animationDuration}`
        case "zoom":
          return `${baseNonCurrentClasses} animate-out zoom-out-95 duration-${animationDuration}`
        case "flip":
          return `${baseNonCurrentClasses} animate-out spin-out-${
            transitionDirection === "next" ? "-90" : "90"
          } duration-${animationDuration}`
        case "none":
        default:
          return baseNonCurrentClasses
      }
    }

    // For all other slides
    return baseNonCurrentClasses
  }

  // Render indicators based on type
  const renderIndicators = () => {
    switch (indicatorType) {
      case "dot":
        return (
          <div className="absolute bottom-6 md:bottom-10 left-1/2 z-30 flex -translate-x-1/2 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )
      case "number":
        return (
          <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-30">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )
      case "thumbnail":
        return (
          <div className="absolute bottom-6 md:bottom-10 left-1/2 z-30 flex -translate-x-1/2 space-x-2 overflow-x-auto max-w-[90%] pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-16 h-10 rounded-md overflow-hidden transition-all duration-300 ${
                  index === currentIndex ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                  quality={70} // Lower quality for thumbnails
                />
              </button>
            ))}
          </div>
        )
      case "line":
      default:
        return (
          <div className="absolute bottom-6 md:bottom-10 left-1/2 z-30 flex -translate-x-1/2 space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              >
                <div
                  className={`h-[2px] transition-all duration-300 ${
                    index === currentIndex ? "w-10 md:w-12 bg-white" : "w-5 md:w-6 bg-white/40 hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
        )
    }
  }

  return (
    <div
      ref={sliderRef}
      className={`relative overflow-hidden ${height} ${className} will-change-transform`}
      style={{ margin: 0, padding: 0, display: "block" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image slider"
      tabIndex={0}
    >
      {/* Images */}
      <div className="absolute inset-0 w-full h-full" style={{ margin: 0, padding: 0 }}>
        {images.map((image, index) => {
          // Only render images that are current, previous, or next to save resources
          const isActive =
            index === currentIndex ||
            index === prevIndex ||
            index === (currentIndex + 1) % images.length ||
            index === (currentIndex - 1 + images.length) % images.length

          if (!isActive && images.length > 3) {
            return <div key={index} className="hidden" aria-hidden="true"></div>
          }

          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full ${getAnimationClasses(index)} will-change-transform`}
              style={{
                margin: 0,
                padding: 0,
                transform: "translateZ(0)", // Force GPU acceleration
                backfaceVisibility: "hidden", // Prevent flickering in some browsers
              }}
              aria-hidden={index !== currentIndex}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === currentIndex && priority}
                sizes="100vw"
                style={{
                  objectPosition: "center top",
                  margin: 0,
                  padding: 0,
                  transform: "translateZ(0)", // Force GPU acceleration
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  position: "absolute",
                }}
                quality={quality}
                loading={index === currentIndex || index === prevIndex ? "eager" : "lazy"}
              />
              <div className={`absolute inset-0 ${getOverlayClass()}`} />
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows - Only render if there's more than one image */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 md:left-8 top-1/2 z-30 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            className="absolute right-4 md:right-8 top-1/2 z-30 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Indicators - Only render if there's more than one image */}
      {images.length > 1 && renderIndicators()}

      {/* Slide content overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="container mx-auto px-4 pointer-events-auto">
          {/* Content will be provided by parent component */}
        </div>
      </div>
    </div>
  )
}
