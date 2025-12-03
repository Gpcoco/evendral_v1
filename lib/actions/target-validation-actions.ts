'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Calcola distanza tra due coordinate (Haversine formula)
function getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

async function markTargetCompleted(targetId: string, playerId: string, episodeId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('player_target_progress')
    .upsert({
      player_id: playerId,
      target_id: targetId,
      episode_id: episodeId,
      completed: true,
      completed_at: new Date().toISOString(),
    });
  
  if (error) throw error;
  revalidatePath(`/player/episodes/${episodeId}`);
}

export async function validateCodeEntry(targetId: string, code: string, playerId: string, episodeId: string) {
  const supabase = await createClient();
  
  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('target_id', targetId)
    .single();
  
  if (!target || target.type !== 'code_entry') {
    return { success: false, message: 'Target not found' };
  }
  
  if (target.payload.code !== code) {
    return { success: false, message: 'Incorrect code' };
  }
  
  await markTargetCompleted(targetId, playerId, episodeId);
  return { success: true, message: 'Code accepted!' };
}

export async function validateGpsLocation(
  targetId: string, 
  playerLat: number, 
  playerLng: number, 
  playerId: string, 
  episodeId: string
) {
  const supabase = await createClient();
  
  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('target_id', targetId)
    .single();
  
  if (!target || target.type !== 'gps_location') {
    return { success: false, message: 'Target not found' };
  }
  
  const distance = getDistanceInMeters(
    playerLat, 
    playerLng, 
    target.payload.lat, 
    target.payload.lng
  );
  
  if (distance > target.payload.radius) {
    return { 
      success: false, 
      message: `You are ${Math.round(distance)}m away. Get within ${target.payload.radius}m of ${target.payload.name}` 
    };
  }
  
  await markTargetCompleted(targetId, playerId, episodeId);
  return { success: true, message: `Location confirmed: ${target.payload.name}` };
}

export async function validateQrCode(
  targetId: string, 
  scannedCode: string, 
  playerId: string, 
  episodeId: string
) {
  const supabase = await createClient();
  
  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('target_id', targetId)
    .single();
  
  if (!target || target.type !== 'qr_scan') {
    return { success: false, message: 'Target not found' };
  }
  
  if (target.payload.qr_code !== scannedCode) {
    return { success: false, message: 'Invalid QR code' };
  }
  
  await markTargetCompleted(targetId, playerId, episodeId);
  return { success: true, message: 'QR code verified!' };
}