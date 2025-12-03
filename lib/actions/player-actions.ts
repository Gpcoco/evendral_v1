'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const ADVENTURE_ID = process.env.NEXT_PUBLIC_ADVENTURE_ID!;

export async function getPlayerByUserId(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('player')
    .select('*')
    .eq('user_id', userId)
    .eq('adventure_id', ADVENTURE_ID)
    .single();
  
  return data;
}

export async function createPlayer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const displayName = formData.get('display_name') as string;
  
  const { error } = await supabase
    .from('player')
    .insert({
      user_id: user.id,
      adventure_id: ADVENTURE_ID,
      display_name: displayName,
    });

  if (error) throw error;
  
  redirect('/player/profile');
}