"use client"

import { useState, useEffect } from "react"
import { ImageSlider } from "@/components/image-slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { isLowEndDevice } from "@/utils/performance-utils"

export function DemoSlider() {
  const [animation, setAnimation] = useState<"fade" | "slide" | "zoom" | "flip" | "none">("slide")
  const [duration, setDuration] = useState(700)
  const [indicatorType, setIndicatorType] = useState<"line" | "dot" | "number" | "thumbnail">("line")
  const [quality, setQuality] = useState(85)
  const [isLowEnd, setIsLowEnd] = useState(false)
  const [optimizeForLowEnd, setOptimizeForLowEnd] = useState(false)

  // Check if device is low-end on mount
  useEffect(() => {
    setIsLowEnd(isLowEndDevice())
  }, [])

  // Sample slider images
  const sliderImages = [
    {
      src: "/images/hero-1.png",
      alt: "Modern construction project with workers on site",
    },
    {
      src: "/images/hero-2.png",
      alt: "Residential building construction with scaffolding",
    },
    {
      src: "/images/hero-3.png",
      alt: "Commercial construction site with cranes",
    },
    {
      src: "/images/hero-4.png",
      alt: "Architectural design of modern building",
    },
  ]

  // Apply optimizations for low-end devices
  useEffect(() => {
    if (isLowEnd && optimizeForLowEnd) {
      setAnimation("fade")
      setDuration(500)
      setQuality(60)
      setIndicatorType("dot")
    }
  }, [isLowEnd, optimizeForLowEnd])

  return (
    <div className="space-y-8">
      <div className="relative w-full overflow-hidden rounded-xl">
        <ImageSlider
          images={sliderImages}
          height="h-[400px]"
          overlay="gradient"
          animation={animation}
          animationDuration={duration}
          indicatorType={indicatorType}
          quality={quality}
        />
      </div>

      {isLowEnd && (
        <div className="bg-amber-50 p-4 rounded-lg flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-medium">Low-end device detected</h3>
            <p className="text-sm text-gray-600">Enable optimizations for better performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="optimize-switch" checked={optimizeForLowEnd} onCheckedChange={setOptimizeForLowEnd} />
            <Label htmlFor="optimize-switch">Optimize</Label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Animation Type</label>
          <Select value={animation} onValueChange={(value) => setAnimation(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="flip">Flip</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Animation Duration: {duration}ms</label>
          <Slider value={[duration]} min={300} max={1500} step={100} onValueChange={(value) => setDuration(value[0])} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Indicator Type</label>
          <Select value={indicatorType} onValueChange={(value) => setIndicatorType(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select indicator type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="dot">Dot</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="thumbnail">Thumbnail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Image Quality: {quality}%</label>
          <Slider value={[quality]} min={30} max={100} step={5} onValueChange={(value) => setQuality(value[0])} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Performance Tips</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Use "fade" animation for the smoothest performance</li>
          <li>• Reduce animation duration on low-end devices</li>
          <li>• Lower image quality to reduce memory usage</li>
          <li>• Use "dot" or "number" indicators instead of thumbnails</li>
        </ul>
      </div>
    </div>
  )
}
