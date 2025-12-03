import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayerByUserId } from '@/lib/actions/player-actions';
import { getPublishedEpisodes } from '@/lib/actions/player-episodes-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EpisodesList } from './_components/episodes-list';

export default async function PlayerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');
  
  const player = await getPlayerByUserId(user.id);
  if (!player) redirect('/onboarding/player');

  const episodes = await getPublishedEpisodes();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Player Profile</h1>
      
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Character Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {player.display_name}
            </div>
            <div>
              <span className="font-semibold">Level:</span> {player.level}
            </div>
            <div>
              <span className="font-semibold">Experience:</span> {player.experience_points} XP
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            {episodes.length === 0 ? (
              <p className="text-muted-foreground">No episodes available yet.</p>
            ) : (
              <EpisodesList episodes={episodes} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}