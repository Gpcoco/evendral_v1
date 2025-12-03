'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getNodeLogic(nodeId: string) {
  const supabase = await createClient();
  
  const [conditions, targets, effects] = await Promise.all([
    supabase.from('conditions').select('*').eq('node_id', nodeId),
    supabase.from('targets').select('*').eq('node_id', nodeId),
    supabase.from('effects').select('*').eq('node_id', nodeId),
  ]);

  return {
    conditions: conditions.data || [],
    targets: targets.data || [],
    effects: effects.data || [],
  };
}

export async function createCondition(nodeId: string, episodeId: string, type: string, payload: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('conditions').insert({
    node_id: nodeId,
    episode_id: episodeId,
    type,
    payload: JSON.parse(payload),
  });
  
  if (error) throw error;
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function createTarget(nodeId: string, episodeId: string, type: string, payload: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('targets').insert({
    node_id: nodeId,
    episode_id: episodeId,
    type,
    payload: JSON.parse(payload),
  });
  
  if (error) throw error;
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function createEffect(nodeId: string, episodeId: string, type: string, payload: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('effects').insert({
    node_id: nodeId,
    episode_id: episodeId,
    type,
    payload: JSON.parse(payload),
  });
  
  if (error) throw error;
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function deleteCondition(id: string, episodeId: string) {
  const supabase = await createClient();
  await supabase.from('conditions').delete().eq('condition_id', id);
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function deleteTarget(id: string, episodeId: string) {
  const supabase = await createClient();
  await supabase.from('targets').delete().eq('target_id', id);
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function deleteEffect(id: string, episodeId: string) {
  const supabase = await createClient();
  await supabase.from('effects').delete().eq('effect_id', id);
  revalidatePath(`/admin/episodes/${episodeId}`);
}