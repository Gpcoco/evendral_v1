'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { updatePlayerLocation } from '@/lib/actions/location'

export type GpsTrackingInterval = 5 | 10 | 20

export type GpsTrackingState = {
  isEnabled: boolean
  interval: GpsTrackingInterval
  isTracking: boolean
  lastUpdate: Date | null
  error: string | null
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown'
}

export type GpsTrackingActions = {
  enable: () => void
  disable: () => void
  setInterval: (interval: GpsTrackingInterval) => void
  requestPermission: () => Promise<boolean>
}

const STORAGE_KEY = 'evendral_gps_settings'

type StoredSettings = {
  enabled: boolean
  interval: GpsTrackingInterval
}

/**
 * Hook per gestire il tracking GPS automatico del giocatore
 * 
 * Features:
 * - Tracking automatico ogni 5/10/20 secondi
 * - Gestione permessi geolocation
 * - Persistenza preferenze in localStorage
 * - Cleanup automatico on unmount
 * - Error handling robusto
 */
export function useGpsTracking(): [GpsTrackingState, GpsTrackingActions] {
  // Stato principale
  const [isEnabled, setIsEnabled] = useState(false)
  const [trackingInterval, setTrackingInterval] = useState<GpsTrackingInterval>(10)
  const [isTracking, setIsTracking] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown')

  // Refs per cleanup - usando number per browser setTimeout/setInterval
  const intervalIdRef = useRef<number | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  // Carica preferenze da localStorage al mount
  useEffect(() => {
    isMountedRef.current = true

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const settings: StoredSettings = JSON.parse(stored)
        setIsEnabled(settings.enabled)
        setTrackingInterval(settings.interval)
      }
    } catch (err) {
      console.error('Error loading GPS settings:', err)
    }

    // Check permission state iniziale
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (isMountedRef.current) {
          setPermissionState(result.state as 'granted' | 'denied' | 'prompt')
        }
      }).catch(() => {
        setPermissionState('unknown')
      })
    }

    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Salva preferenze in localStorage quando cambiano
  useEffect(() => {
    try {
      const settings: StoredSettings = { enabled: isEnabled, interval: trackingInterval }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (err) {
      console.error('Error saving GPS settings:', err)
    }
  }, [isEnabled, trackingInterval])

  // Function per ottenere e inviare posizione GPS
    const trackPosition = useCallback(async (position: GeolocationPosition) => {
    if (!isMountedRef.current) return

    console.log('📍 GPS Position received:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
    })

    try {
        setIsTracking(true)
        setError(null)

        console.log('🚀 Calling updatePlayerLocation...')
        
        const result = await updatePlayerLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy,
        position.coords.heading ?? undefined,
        position.coords.speed ?? undefined
        )

        console.log('✅ UpdatePlayerLocation result:', result)

        if (!isMountedRef.current) return

        if (result.success) {
        setLastUpdate(new Date())
        console.log('✅ Location updated successfully')
        } else {
        setError(result.error || 'Errore aggiornamento posizione')
        console.error('❌ Error updating location:', result.error)
        }
    } catch (err) {
        console.error('❌ Exception in trackPosition:', err)
        if (!isMountedRef.current) return
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
        if (isMountedRef.current) {
        setIsTracking(false)
        }
    }
    }, [])

  // Error handler per geolocation
  const handleGpsError = useCallback((error: GeolocationPositionError) => {
    if (!isMountedRef.current) return

    let errorMessage = 'Errore GPS'
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permesso GPS negato'
        setPermissionState('denied')
        setIsEnabled(false) // Auto-disable se permesso negato
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Posizione non disponibile'
        break
      case error.TIMEOUT:
        errorMessage = 'Timeout GPS'
        break
    }
    setError(errorMessage)
    setIsTracking(false)
  }, [])

  // Opzioni geolocation ottimizzate per batteria (memo per evitare re-render)
  const geoOptions: PositionOptions = useMemo(() => ({
    enableHighAccuracy: false, // false = risparmio batteria (±20-50m accuracy)
    timeout: 5000, // 5s timeout
    maximumAge: 8000, // riusa fix recenti (8s)
  }), [])

  // Start/stop tracking quando isEnabled o trackingInterval cambiano
  useEffect(() => {
    // Cleanup precedente
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (!isEnabled) {
      setIsTracking(false)
      setError(null)
      return
    }

    // Verifica supporto geolocation
    if (!navigator.geolocation) {
      setError('Geolocation non supportata dal browser')
      setIsEnabled(false)
      return
    }

    // Primo update immediato
    navigator.geolocation.getCurrentPosition(
      trackPosition,
      handleGpsError,
      geoOptions
    )

    // Setup interval per update successivi
    intervalIdRef.current = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        trackPosition,
        handleGpsError,
        geoOptions
      )
    }, trackingInterval * 1000)

    // Cleanup function
    return () => {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current)
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isEnabled, trackingInterval, trackPosition, handleGpsError, geoOptions])

  // Actions
  const enable = useCallback(() => {
    setIsEnabled(true)
    setError(null)
  }, [])

  const disable = useCallback(() => {
    setIsEnabled(false)
    setError(null)
    setLastUpdate(null)
  }, [])

  const changeInterval = useCallback((newInterval: GpsTrackingInterval) => {
    setTrackingInterval(newInterval)
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Tenta di ottenere posizione per triggerare permesso
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
        })
      })

      setPermissionState('granted')
      return true
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState('denied')
        }
      }
      return false
    }
  }, [])

  const state: GpsTrackingState = {
    isEnabled,
    interval: trackingInterval,
    isTracking,
    lastUpdate,
    error,
    permissionState,
  }

  const actions: GpsTrackingActions = {
    enable,
    disable,
    setInterval: changeInterval,
    requestPermission,
  }

  return [state, actions]
}