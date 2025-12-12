'use client'

import { useEffect, useState } from 'react'
import { MapPin, MapPinOff, Loader2, AlertCircle } from 'lucide-react'
import { useGpsTracking } from '@/hooks/useGpsTracking'
import { cn } from '@/lib/utils'

type GpsStatusIndicatorProps = {
  className?: string
  showText?: boolean
}

/**
 * Indicatore visivo dello stato GPS
 * Mostra icona + badge colorato per feedback immediato
 */
export function GpsStatusIndicator({ 
  className, 
  showText = false 
}: GpsStatusIndicatorProps) {
  const [state] = useGpsTracking()
  const [mounted, setMounted] = useState(false)

  // Previeni hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Non renderizzare durante SSR
  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="rounded-full p-1.5 bg-slate-400/10">
          <MapPinOff className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    )
  }

  const getStatusConfig = () => {
    if (!state.isEnabled) {
      return {
        icon: MapPinOff,
        color: 'text-slate-400',
        bgColor: 'bg-slate-400/10',
        text: 'GPS disattivato',
      }
    }

    if (state.error) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        text: state.error,
      }
    }

    if (state.isTracking) {
      return {
        icon: Loader2,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        text: 'Rilevamento...',
        animate: true,
      }
    }

    return {
      icon: MapPin,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      text: 'GPS attivo',
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('rounded-full p-1.5', config.bgColor)}>
        <Icon 
          className={cn('h-3.5 w-3.5', config.color, config.animate && 'animate-spin')} 
        />
      </div>
      
      {showText && (
        <span className="text-xs text-muted-foreground">
          {config.text}
        </span>
      )}
    </div>
  )
}