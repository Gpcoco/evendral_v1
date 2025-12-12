'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, Power, PowerOff } from 'lucide-react'
import { useGpsTracking, type GpsTrackingInterval } from '@/hooks/useGpsTracking'
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'

/**
 * Menu impostazioni GPS da inserire nel dropdown profilo
 * Include toggle on/off e selezione intervallo tracking
 */
export function GpsSettingsMenu() {
  const [state, actions] = useGpsTracking()
  const [mounted, setMounted] = useState(false)

  // Previeni hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = async () => {
    console.log('🔘 Toggle GPS clicked. Current state:', state.isEnabled)
    
    if (!state.isEnabled) {
      console.log('📍 Attempting to enable GPS...')
      if (state.permissionState === 'prompt' || state.permissionState === 'unknown') {
        console.log('🔐 Requesting permission...')
        const granted = await actions.requestPermission()
        console.log('🔐 Permission result:', granted)
        if (granted) {
          actions.enable()
          console.log('✅ GPS enabled')
        }
      } else if (state.permissionState === 'granted') {
        console.log('✅ Permission already granted, enabling...')
        actions.enable()
      } else {
        console.log('❌ Permission denied')
        alert('Permesso GPS negato. Abilita i permessi di localizzazione nelle impostazioni del browser.')
      }
    } else {
      console.log('🛑 Disabling GPS...')
      actions.disable()
      console.log('✅ GPS disabled')
    }
  }

  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value) as GpsTrackingInterval
    console.log('⏱️ Changing interval to:', interval)
    actions.setInterval(interval)
  }

  // Non renderizzare durante SSR
  if (!mounted) {
    return null
  }

  return (
    <>
      <DropdownMenuSeparator className="bg-slate-700" />
      
      {/* Label con colore forzato per dark theme */}
      <DropdownMenuLabel className="text-xs font-medium text-slate-400">
        Tracciamento GPS
      </DropdownMenuLabel>

      {/* Toggle GPS ON/OFF */}
      <DropdownMenuItem
        onClick={handleToggle}
        className="gap-2 cursor-pointer text-slate-200 hover:text-white focus:text-white"
      >
        <div className="flex items-center gap-2 flex-1">
          {state.isEnabled ? (
            <>
              <Power className="h-4 w-4 text-emerald-500" />
              <span>Disabilita posizione</span>
            </>
          ) : (
            <>
              <PowerOff className="h-4 w-4 text-slate-400" />
              <span>Abilita posizione</span>
            </>
          )}
        </div>
        <div className={`w-2 h-2 rounded-full ${state.isEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
      </DropdownMenuItem>

      {/* Status info con colori chiari */}
      <div className="px-2 py-1.5 text-[10px] text-slate-400 font-mono">
        Stato: {state.isEnabled ? '🟢 Attivo' : '⚪ Disattivo'} | 
        Permesso: {state.permissionState}
      </div>

      {/* Warning se permesso negato */}
      {state.permissionState === 'denied' && (
        <div className="mx-2 my-1 px-2 py-2 text-xs text-amber-400 bg-amber-500/10 rounded border border-amber-500/30 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Permesso GPS negato nelle impostazioni browser</span>
        </div>
      )}

      {/* Submenu intervallo tracking */}
      {state.isEnabled && (
        <>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 text-slate-200">
              <Clock className="h-4 w-4" />
              <span>Intervallo: {state.interval}s</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-slate-900 border-slate-700">
              <DropdownMenuRadioGroup 
                value={String(state.interval)} 
                onValueChange={handleIntervalChange}
              >
                <DropdownMenuRadioItem value="5" className="text-slate-200">
                  <div className="flex flex-col">
                    <span>5 secondi</span>
                    <span className="text-xs text-slate-400">Alta precisione</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="10" className="text-slate-200">
                  <div className="flex flex-col">
                    <span>10 secondi</span>
                    <span className="text-xs text-slate-400">Bilanciato (consigliato)</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="20" className="text-slate-200">
                  <div className="flex flex-col">
                    <span>20 secondi</span>
                    <span className="text-xs text-slate-400">Risparmio batteria</span>
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </>
      )}

      {/* Ultimo update - colore verde chiaro */}
      {state.lastUpdate && (
        <div className="px-2 py-1.5 text-xs text-emerald-400 font-mono">
          ✓ Aggiornato: {state.lastUpdate.toLocaleTimeString('it-IT')}
        </div>
      )}

      {/* Errori - rosso chiaro */}
      {state.error && (
        <div className="mx-2 my-1 px-2 py-1.5 text-xs text-red-400 bg-red-500/10 rounded border border-red-500/30">
          ⚠️ {state.error}
        </div>
      )}
    </>
  )
}