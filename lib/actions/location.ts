'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Tipi per le coordinate GPS
 */
export type Coordinates = {
  latitude: number
  longitude: number
}

export type PlayerLocation = {
  user_id: string
  latitude: number
  longitude: number
  accuracy: number
  heading?: number
  speed?: number
  updated_at: string
}

export type NearbyPlayer = {
  nearby_user_id: string
  distance_meters: number
  last_seen: string
  is_stale: boolean
}

/**
 * Tipi per return values delle RPC functions
 */
type RpcCoordinatesResult = {
  latitude: number
  longitude: number
  accuracy: number
  updated_at: string
}

/**
 * Aggiorna la posizione corrente del giocatore
 * Usa UPSERT per evitare duplicati (1 row per user)
 */
export async function updatePlayerLocation(
  latitude: number,
  longitude: number,
  accuracy: number,
  heading?: number,
  speed?: number
) {
  try {
    const supabase = await createClient()
    
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autenticato' }
    }

    // Validazione input
    if (latitude < -90 || latitude > 90) {
      return { success: false, error: 'Latitudine non valida' }
    }
    if (longitude < -180 || longitude > 180) {
      return { success: false, error: 'Longitudine non valida' }
    }
    if (accuracy < 0 || accuracy > 1000) {
      return { success: false, error: 'Accuracy deve essere 0-1000m' }
    }

    // UPSERT con PostGIS point
    // IMPORTANTE: PostGIS usa formato POINT(longitude latitude) - notare l'ordine!
    const { error } = await supabase
      .from('player_current_location')
      .upsert({
        user_id: user.id,
        position: `POINT(${longitude} ${latitude})`,
        accuracy,
        heading: heading ?? null,
        speed: speed ?? null,
      }, { 
        onConflict: 'user_id' // Upsert sulla primary key
      })

    if (error) {
      console.error('Error updating location:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating location:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }
  }
}

/**
 * Recupera la posizione corrente del giocatore autenticato
 */
export async function getCurrentPlayerLocation(): Promise<{
  success: boolean
  data?: PlayerLocation
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autenticato' }
    }

    // Usa la RPC function per estrarre coordinate
    const { data, error } = await supabase
      .rpc('get_player_coordinates', { p_user_id: user.id })
      .maybeSingle() // Usa maybeSingle invece di single per gestire null

    if (error) {
      console.error('Error fetching location:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Posizione non trovata' }
    }

    // Type assertion per il risultato RPC
    const locationData = data as RpcCoordinatesResult

    return {
      success: true,
      data: {
        user_id: user.id,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        updated_at: locationData.updated_at,
      }
    }
  } catch (error) {
    console.error('Unexpected error fetching location:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }
  }
}

/**
 * Verifica se il giocatore è entro un raggio da un punto target
 * Usata per validare GPS targets nei content nodes
 */
export async function validateGpsProximity(
  targetLatitude: number,
  targetLongitude: number,
  radiusMeters: number
): Promise<{
  success: boolean
  isWithinRadius?: boolean
  distance?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autenticato' }
    }

    // Verifica se player è nel raggio
    const { data: withinRadiusData, error: radiusError } = await supabase
      .rpc('is_within_radius', {
        p_user_id: user.id,
        p_target_lat: targetLatitude,
        p_target_lng: targetLongitude,
        p_radius_meters: radiusMeters
      })
      .maybeSingle()

    if (radiusError) {
      console.error('Error checking proximity:', radiusError)
      return { success: false, error: radiusError.message }
    }

    // Type assertion: RPC ritorna boolean
    const withinRadius = withinRadiusData as boolean | null

    // Calcola anche la distanza esatta per feedback UI
    const { data: distanceData, error: distanceError } = await supabase
      .rpc('get_distance_to_point', {
        p_user_id: user.id,
        p_target_lat: targetLatitude,
        p_target_lng: targetLongitude
      })
      .maybeSingle()

    if (distanceError) {
      console.error('Error calculating distance:', distanceError)
      // Non bloccare se solo il calcolo distanza fallisce
      return { 
        success: true, 
        isWithinRadius: withinRadius ?? false,
        distance: undefined 
      }
    }

    // Type assertion: RPC ritorna number
    const distance = distanceData as number | null

    return {
      success: true,
      isWithinRadius: withinRadius ?? false,
      distance: distance ? Math.round(distance) : undefined
    }
  } catch (error) {
    console.error('Unexpected error validating proximity:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }
  }
}

/**
 * Trova giocatori nelle vicinanze (per features multiplayer future)
 */
export async function findNearbyPlayers(
  radiusMeters: number = 100,
  maxResults: number = 50
): Promise<{
  success: boolean
  players?: NearbyPlayer[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autenticato' }
    }

    const { data, error } = await supabase
      .rpc('find_nearby_players', {
        p_user_id: user.id,
        p_radius_meters: radiusMeters,
        p_max_results: maxResults
      })

    if (error) {
      console.error('Error finding nearby players:', error)
      return { success: false, error: error.message }
    }

    // Type assertion per array di risultati
    const players = (data as NearbyPlayer[] | null) ?? []

    return {
      success: true,
      players
    }
  } catch (error) {
    console.error('Unexpected error finding nearby players:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }
  }
}

/**
 * Elimina la posizione corrente del giocatore
 * Utile per privacy/opt-out del tracking
 */
export async function deletePlayerLocation(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autenticato' }
    }

    const { error } = await supabase
      .from('player_current_location')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting location:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting location:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }
  }
}

/**
 * [ADMIN ONLY] Cleanup posizioni obsolete
 * Da chiamare con scheduled job (es. ogni notte)
 */
export async function cleanupStaleLocations(
  hoursOld: number = 24
): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Verifica che user sia admin (adatta alla tua logica admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Non autenticato' }
    }

    // TODO: Aggiungi check per ruolo admin
    // const isAdmin = await checkIfUserIsAdmin(user.id)
    // if (!isAdmin) {
    //   return { success: false, error: 'Permessi insufficienti' }
    // }

    const { data, error } = await supabase
      .rpc('cleanup_stale_locations', {
        p_hours_old: hoursOld
      })
      .maybeSingle()

    if (error) {
      console.error('Error cleaning up locations:', error)
      return { success: false, error: error.message }
    }

    // Type assertion: RPC ritorna integer
    const deletedCount = (data as number | null) ?? 0

    return {
      success: true,
      deletedCount
    }
  } catch (error) {
    console.error('Unexpected error cleaning up locations:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }
  }
}
