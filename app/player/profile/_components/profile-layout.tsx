'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EpisodeCard } from './episode-card';
import { Trophy, Star, Target, LogOut } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Player {
  player_id: string;
  display_name: string | null;
  level: number;
  experience_points: number;
}

interface Episode {
  episode_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  start_datetime: string;
}

interface Props {
  player: Player;
  episodes: Episode[];
}

export function ProfileLayout({ player, episodes }: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  // Calcola XP per prossimo livello
  const xpForNextLevel = player.level * 1000;
  const xpProgress = (player.experience_points % 1000) / 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">Evendral</span>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>
      </header>

      {/* Profile Hero */}
      <section className="px-4 pt-8 pb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur rounded-2xl border border-slate-700 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-lg">
                {player.display_name?.charAt(0).toUpperCase() || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {player.display_name}
                </h1>
                <p className="text-slate-400 mb-4">Avventuriero</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-amber-400" />
                      <span className="text-2xl font-bold text-amber-400">{player.level}</span>
                    </div>
                    <p className="text-xs text-slate-400">Livello</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-blue-400">{player.experience_points}</span>
                    </div>
                    <p className="text-xs text-slate-400">XP Totali</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">{episodes.length}</span>
                    </div>
                    <p className="text-xs text-slate-400">Episodi</p>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>XP per livello {player.level + 1}</span>
                    <span>{player.experience_points % 1000} / {xpForNextLevel}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-1000 ease-out"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-amber-500">📜</span>
            Episodi Disponibili
          </h2>

          {episodes.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-slate-400 text-lg mb-2">Nessun episodio disponibile</p>
                <p className="text-slate-500 text-sm">Torna presto per nuove avventure!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {episodes.map((episode, index) => (
                <div
                  key={episode.episode_id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EpisodeCard episode={episode} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 mt-12 border-t border-slate-800">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-slate-500 text-sm">
            Evendral © 2024 - La tua avventura continua
          </p>
        </div>
      </footer>
    </div>
  );
}