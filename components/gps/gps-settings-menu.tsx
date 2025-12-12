'use client'

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

  const handleToggle = async () => {
    console.log('🔘 Toggle GPS clicked. Current state:', state.isEnabled)
    
    if (!state.isEnabled) {
      console.log('📍 Attempting to enable GPS...')
      // Sta per essere abilitato - richiedi permessi
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

  return (
    <>
      <DropdownMenuSeparator />
      
      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
        Tracciamento GPS
      </DropdownMenuLabel>

      {/* Toggle GPS ON/OFF con feedback visivo chiaro */}
      <DropdownMenuItem
        onClick={handleToggle}
        className="gap-2 cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-1">
          {state.isEnabled ? (
            <Power className="h-4 w-4 text-emerald-500" />
          ) : (
            <PowerOff className="h-4 w-4 text-slate-400" />
          )}
          <span>{state.isEnabled ? 'Disabilita' : 'Abilita'} posizione</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${state.isEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
      </DropdownMenuItem>

      {/* Status info */}
      <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-mono">
        Stato: {state.isEnabled ? '🟢 Attivo' : '⚪ Disattivo'} | 
        Permesso: {state.permissionState}
      </div>

      {/* Warning se permesso negato */}
      {state.permissionState === 'denied' && (
        <div className="mx-2 my-1 px-2 py-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-500/10 rounded border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Permesso GPS negato nelle impostazioni browser</span>
        </div>
      )}

      {/* Submenu intervallo tracking (solo se GPS enabled) */}
      {state.isEnabled && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Clock className="h-4 w-4" />
              <span>Intervallo: {state.interval}s</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup 
                value={String(state.interval)} 
                onValueChange={handleIntervalChange}
              >
                <DropdownMenuRadioItem value="5">
                  <div className="flex flex-col">
                    <span>5 secondi</span>
                    <span className="text-xs text-muted-foreground">Alta precisione</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="10">
                  <div className="flex flex-col">
                    <span>10 secondi</span>
                    <span className="text-xs text-muted-foreground">Bilanciato (consigliato)</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="20">
                  <div className="flex flex-col">
                    <span>20 secondi</span>
                    <span className="text-xs text-muted-foreground">Risparmio batteria</span>
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </>
      )}

      {/* Mostra ultimo update */}
      {state.lastUpdate && (
        <div className="px-2 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
          ✓ Aggiornato: {state.lastUpdate.toLocaleTimeString('it-IT')}
        </div>
      )}

      {/* Mostra errori */}
      {state.error && (
        <div className="mx-2 my-1 px-2 py-1.5 text-xs text-red-500 bg-red-500/10 rounded border border-red-500/20">
          ⚠️ {state.error}
        </div>
      )}
    </>
  )
}