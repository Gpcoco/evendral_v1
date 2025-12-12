'use client'

import { useEffect, useState } from 'react'
import { useGpsTracking } from '@/hooks/useGpsTracking'

export function GpsTrackingBar() {
  const [state] = useGpsTracking()
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Previeni hydration mismatch - mount solo client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!state.isEnabled) {
      setProgress(0)
      return
    }
    
    // Reset progress quando arriva un nuovo update
    setProgress(0)

    // Avvia animazione
    const startTime = Date.now()
    const duration = state.interval * 1000

    const animationFrame = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      
      setProgress(newProgress)

      // Stop quando raggiunge 100%
      if (newProgress >= 100) {
        clearInterval(animationFrame)
      }
    }, 50)

    return () => clearInterval(animationFrame)
  }, [state.isEnabled, state.interval, state.lastUpdate])

  // Non renderizzare nulla durante SSR
  if (!mounted) {
    return null
  }

  // 🐛 SEMPRE VISIBILE PER DEBUG
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Barra countdown - visibile solo se GPS attivo */}
      {state.isEnabled && (
        <div
          className="h-[3px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-[50ms] ease-linear"
          style={{ width: `${progress}%` }}
        />
      )}
      
      
    </div>
  )
}