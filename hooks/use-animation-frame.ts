"use client"

import { useRef, useEffect, useCallback } from "react"

type AnimationFrameCallback = (time: number) => void

export function useAnimationFrame(callback: AnimationFrameCallback, active = true) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const callbackRef = useRef<AnimationFrameCallback>(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Set up the animation loop
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      callbackRef.current(time)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [])

  // Start and stop the animation loop based on active state
  useEffect(() => {
    if (active) {
      requestRef.current = requestAnimationFrame(animate)
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current)
        }
      }
    }
  }, [animate, active])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])
}
