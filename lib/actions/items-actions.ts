'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ItemInsert, ItemUpdate } from '@/lib/types/database';

const ADVENTURE_ID = process.env.NEXT_PUBLIC_ADVENTURE_ID!;

export async function getItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('adventure_id', ADVENTURE_ID)
    .is('episode_id', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createItem(item: ItemInsert) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .insert({ ...item, adventure_id: ADVENTURE_ID, episode_id: null });

  if (error) throw error;
  revalidatePath('/admin/items');
}

export async function updateItem(id: string, item: ItemUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .update(item)
    .eq('item_id', id)
    .eq('adventure_id', ADVENTURE_ID);

  if (error) throw error;
  revalidatePath('/admin/items');
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('item_id', id)
    .eq('adventure_id', ADVENTURE_ID);

  if (error) throw error;
  revalidatePath('/admin/items');
}