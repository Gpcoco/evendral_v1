'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ContentNodeInsert, NodeCategory } from '@/lib/types/database';

// =====================================================
// TARGET HTML TEMPLATES
// =====================================================

interface TargetForTemplate {
  target_id: string;
  type: string;
  payload: Record<string, unknown>;
}

function generateTargetHtml(target: TargetForTemplate, index: number): string {
  const { target_id, type, payload } = target;
  
  switch (type) {
    case 'code_entry':
      return `
<div class="evendral-target evendral-code-entry" data-target-id="${target_id}" data-target-index="${index}" data-target-type="code_entry">
  <label for="input-${target_id}">Inserisci il codice:</label>
  <input 
    type="text" 
    id="input-${target_id}" 
    placeholder="Inserisci codice..." 
    autocomplete="off"
  />
  <button type="button" data-action="submit">
    Invia
  </button>
</div>`.trim();

    case 'gps_location':
      return `
<div class="evendral-target evendral-gps-location" data-target-id="${target_id}" data-target-index="${index}" data-target-type="gps_location">
  <p class="location-name">📍 ${payload.name || 'Location'}</p>
  <p class="location-hint">Raggiungi questa posizione (raggio: ${payload.radius}m)</p>
  <button type="button" data-action="submit">
    Verifica Posizione
  </button>
</div>`.trim();

    case 'owned_item':
      return `
<div class="evendral-target evendral-owned-item" data-target-id="${target_id}" data-target-index="${index}" data-target-type="owned_item">
  <p class="item-check">📦 Verifica inventario in corso...</p>
  <p class="item-hint">Devi possedere l'item richiesto</p>
</div>`.trim();

    default:
      return `<!-- Unknown target type: ${type} -->`;
  }
}

function processPlaceholders(
  html: string, 
  targets: TargetForTemplate[]
): string {
  let processedHtml = html;
  
  // Sostituisci {{TARGET_0}}, {{TARGET_1}}, etc. con HTML reale
  targets.forEach((target, index) => {
    const placeholder = `{{TARGET_${index}}}`;
    const targetHtml = generateTargetHtml(target, index);
    processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), targetHtml);
  });
  
  // Rimuovi eventuali placeholder non usati (index > targets.length)
  processedHtml = processedHtml.replace(/\{\{TARGET_\d+\}\}/g, '<!-- Target placeholder non valido -->');
  
  return processedHtml;
}

// =====================================================
// BASIC CRUD ACTIONS
// =====================================================

export async function getNodesByEpisode(episodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('episode_id', episodeId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createNode(formData: FormData) {
  const supabase = await createClient();
  const episodeId = formData.get('episode_id') as string;
  
  const node: ContentNodeInsert = {
    episode_id: episodeId,
    name: formData.get('name') as string,
    node_category: (formData.get('node_category') as NodeCategory) || 'main_story',
    content_html: formData.get('content_html') as string,
    custom_data: {},
  };

  const { error } = await supabase.from('content_nodes').insert(node);
  if (error) throw error;
  
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function deleteNode(nodeId: string, episodeId: string) {
  const supabase = await createClient();

  // Step 1: Get all target_ids for this node
  const { data: targets } = await supabase
    .from('targets')
    .select('target_id')
    .eq('node_id', nodeId);

  // Step 2: Delete player_target_progress for those targets (if any exist)
  if (targets && targets.length > 0) {
    const targetIds = targets.map(t => t.target_id);
    await supabase
      .from('player_target_progress')
      .delete()
      .in('target_id', targetIds);
  }

  // Step 3: Delete all node-related records (foreign key constraints)
  await Promise.all([
    supabase.from('conditions').delete().eq('node_id', nodeId),
    supabase.from('targets').delete().eq('node_id', nodeId),
    supabase.from('effects').delete().eq('node_id', nodeId),
  ]);

  // Step 4: Now delete the node itself
  const { error } = await supabase
    .from('content_nodes')
    .delete()
    .eq('node_id', nodeId);

  if (error) throw error;
  revalidatePath(`/admin/episodes/${episodeId}`);
}

export async function updateNode(nodeId: string, episodeId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('content_nodes')
    .update({
      name: formData.get('name') as string,
      node_category: (formData.get('node_category') as NodeCategory),
      content_html: formData.get('content_html') as string,
    })
    .eq('node_id', nodeId);

  if (error) throw error;
  revalidatePath(`/admin/episodes/${episodeId}`);
}

// =====================================================
// WIZARD ACTIONS - Create/Update Node with Full Logic
// =====================================================

interface NodeWithLogicData {
  name: string;
  category: NodeCategory;
  contentHtml: string; // HTML con placeholder {{TARGET_X}}
  conditions: Array<{ type: string; payload: Record<string, unknown> }>;
  targets: Array<{ type: string; payload: Record<string, unknown> }>;
  effects: Array<{ type: string; payload: Record<string, unknown> }>;
}

export async function createNodeWithLogic(episodeId: string, data: NodeWithLogicData) {
  const supabase = await createClient();
  
  // Step 1: Create node (con HTML placeholder temporaneo)
  const { data: newNode, error: nodeError } = await supabase
    .from('content_nodes')
    .insert({
      episode_id: episodeId,
      name: data.name,
      node_category: data.category,
      content_html: '', // Verrà aggiornato dopo
      custom_data: {},
    })
    .select()
    .single();

  if (nodeError) throw nodeError;

  // Step 2: Insert conditions
  if (data.conditions.length > 0) {
    const conditions = data.conditions.map(c => ({
      node_id: newNode.node_id,
      episode_id: episodeId,
      type: c.type,
      payload: c.payload,
    }));
    
    const { error: condError } = await supabase.from('conditions').insert(conditions);
    if (condError) throw condError;
  }

  // Step 3: Insert targets e recupera ID reali
  let insertedTargets: TargetForTemplate[] = [];
  
  if (data.targets.length > 0) {
    const targets = data.targets.map(t => ({
      node_id: newNode.node_id,
      episode_id: episodeId,
      type: t.type,
      payload: t.payload,
    }));
    
    const { data: targetData, error: targetError } = await supabase
      .from('targets')
      .insert(targets)
      .select('target_id, type, payload');
    
    if (targetError) throw targetError;
    insertedTargets = targetData || [];
  }

  // Step 4: Processa HTML sostituendo placeholder con ID reali
  const processedHtml = processPlaceholders(data.contentHtml, insertedTargets);
  
  // Step 5: Aggiorna node con HTML processato
  const { error: updateError } = await supabase
    .from('content_nodes')
    .update({ content_html: processedHtml })
    .eq('node_id', newNode.node_id);
  
  if (updateError) throw updateError;

  // Step 6: Insert effects
  if (data.effects.length > 0) {
    const effects = data.effects.map(e => ({
      node_id: newNode.node_id,
      episode_id: episodeId,
      type: e.type,
      payload: e.payload,
    }));
    
    const { error: effectError } = await supabase.from('effects').insert(effects);
    if (effectError) throw effectError;
  }

  revalidatePath(`/admin/episodes/${episodeId}`);
  return newNode.node_id;
}

export async function updateNodeWithLogic(nodeId: string, episodeId: string, data: NodeWithLogicData) {
  const supabase = await createClient();
  
  // Step 1: Delete existing logic (conditions/targets/effects)
  // Prima recupera target_ids per pulire player_target_progress
  const { data: existingTargets } = await supabase
    .from('targets')
    .select('target_id')
    .eq('node_id', nodeId);
  
  if (existingTargets && existingTargets.length > 0) {
    const targetIds = existingTargets.map(t => t.target_id);
    await supabase
      .from('player_target_progress')
      .delete()
      .in('target_id', targetIds);
  }
  
  await Promise.all([
    supabase.from('conditions').delete().eq('node_id', nodeId),
    supabase.from('targets').delete().eq('node_id', nodeId),
    supabase.from('effects').delete().eq('node_id', nodeId),
  ]);

  // Step 2: Re-insert conditions
  if (data.conditions.length > 0) {
    const conditions = data.conditions.map(c => ({
      node_id: nodeId,
      episode_id: episodeId,
      type: c.type,
      payload: c.payload,
    }));
    
    const { error: condError } = await supabase.from('conditions').insert(conditions);
    if (condError) throw condError;
  }

  // Step 3: Re-insert targets e recupera ID reali
  let insertedTargets: TargetForTemplate[] = [];
  
  if (data.targets.length > 0) {
    const targets = data.targets.map(t => ({
      node_id: nodeId,
      episode_id: episodeId,
      type: t.type,
      payload: t.payload,
    }));
    
    const { data: targetData, error: targetError } = await supabase
      .from('targets')
      .insert(targets)
      .select('target_id, type, payload');
    
    if (targetError) throw targetError;
    insertedTargets = targetData || [];
  }

  // Step 4: Processa HTML sostituendo placeholder con ID reali
  const processedHtml = processPlaceholders(data.contentHtml, insertedTargets);

  // Step 5: Update node basic info + HTML processato
  const { error: nodeError } = await supabase
    .from('content_nodes')
    .update({
      name: data.name,
      node_category: data.category,
      content_html: processedHtml,
    })
    .eq('node_id', nodeId);

  if (nodeError) throw nodeError;

  // Step 6: Re-insert effects
  if (data.effects.length > 0) {
    const effects = data.effects.map(e => ({
      node_id: nodeId,
      episode_id: episodeId,
      type: e.type,
      payload: e.payload,
    }));
    
    const { error: effectError } = await supabase.from('effects').insert(effects);
    if (effectError) throw effectError;
  }

  revalidatePath(`/admin/episodes/${episodeId}`);
}

// =====================================================
// GET NODE WITH LOGIC (for editing)
// =====================================================

export async function getNodeWithLogic(nodeId: string) {
  const supabase = await createClient();
  
  const [
    { data: node, error: nodeError },
    { data: conditions },
    { data: targets },
    { data: effects }
  ] = await Promise.all([
    supabase.from('content_nodes').select('*').eq('node_id', nodeId).single(),
    supabase.from('conditions').select('*').eq('node_id', nodeId),
    supabase.from('targets').select('*').eq('node_id', nodeId),
    supabase.from('effects').select('*').eq('node_id', nodeId),
  ]);

  if (nodeError) throw nodeError;
  
  return {
    ...node,
    conditions: conditions || [],
    targets: targets || [],
    effects: effects || [],
  };
}

// =====================================================
// UTILITY: Riconverti HTML salvato in placeholder per editing
// =====================================================

export async function htmlToPlaceholders(html: string): Promise<string> {

  let result = html;
  
  // Pattern per trovare i div target generati
  const targetDivPattern = /<div class="evendral-target[^"]*"[^>]*data-target-index="(\d+)"[^>]*>[\s\S]*?<\/div>/g;
  
  // Sostituisci ogni div target con il placeholder corrispondente
  result = result.replace(targetDivPattern, (match, index) => {
    return `{{TARGET_${index}}}`;
  });
  
  return result;
}