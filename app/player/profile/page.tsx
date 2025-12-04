import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getPublishedEpisodes } from '@/lib/actions/player-episodes-actions';
import { ProfileLayout } from './_components/profile-layout';

export default async function PlayerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');
  
  const player = await getPlayerByUserId(user.id);
  if (!player) redirect('/onboarding/player');

  const episodes = await getPublishedEpisodes();

  return (
    <ProfileLayout 
      player={player}
      episodes={episodes}
    />
  );
}