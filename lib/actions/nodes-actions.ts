'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ContentNodeInsert, NodeCategory } from '@/lib/types/database';

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