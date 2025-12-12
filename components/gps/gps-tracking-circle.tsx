'use client'

import { useEffect, useState } from 'react'
import { useGpsTracking } from '@/hooks/useGpsTracking'

/**
 * Cerchio rosso che si riempie progressivamente durante il countdown GPS
 * Mostra visivamente quando avverrà il prossimo rilevamento
 */
export function GpsTrackingCircle() {
  const [state] = useGpsTracking()
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Previeni hydration mismatch
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

  // Non renderizzare durante SSR o se GPS disabilitato
  if (!mounted || !state.isEnabled) {
    return null
  }

  // Calcola circonferenza e offset per l'animazione
  const radius = 8 // raggio cerchio
  const strokeWidth = 2.5
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Cerchio di sfondo (grigio) */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-600"
        />
        {/* Cerchio progressivo (rosso) */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-red-500 transition-all duration-[50ms] ease-linear"
        />
      </svg>
      
      {/* Indicatore centrale se sta trackando */}
      {state.isTracking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  )
}