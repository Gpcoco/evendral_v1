'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getPlayerEpisodeStatsAndEffects,
  type PlayerEpisodeStats,
  type ActiveStatusEffect 
} from '@/lib/actions/player-stats-actions';
import { getEffectConfig, formatTimeRemaining } from '@/lib/config/status-effects';
import { createClient } from '@/lib/supabase/client';
import { GpsTrackingCircle } from '@/components/gps/gps-tracking-circle'
import { GpsSettingsMenu } from '@/components/gps/gps-settings-menu';

interface Props {
  episodeId: string;
  episodeName: string;
  playerId: string;
  playerName: string | null;
}

const EFFECT_COLOR_CLASSES = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function EpisodeHeader({ episodeId, episodeName, playerId, playerName }: Props) {
  const pathname = usePathname();
  const [stats, setStats] = useState<PlayerEpisodeStats | null>(null);
  const [effects, setEffects] = useState<ActiveStatusEffect[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  // Carica statistiche e effetti
  useEffect(() => {
    async function loadData() {
      const data = await getPlayerEpisodeStatsAndEffects(playerId, episodeId);
      setStats(data.stats);
      setEffects(data.effects);
    }
    loadData();
  }, [playerId, episodeId]);

  // Aggiorna countdown effetti temporanei
  useEffect(() => {
    if (effects.length === 0) return;

    const updateTimer = () => {
      const newTimeRemaining: Record<string, string> = {};
      effects.forEach(effect => {
        if (effect.expires_at) {
          newTimeRemaining[effect.status_effect_id] = formatTimeRemaining(
            new Date(effect.expires_at)
          );
        }
      });
      setTimeRemaining(newTimeRemaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [effects]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const isMainStory = pathname === `/player/episodes/${episodeId}`;
  const isSideQuests = pathname === `/player/episodes/${episodeId}/sidequests`;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-lg">
      {/* Prima riga: Titolo + GPS Status + Profilo */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-3 py-3 max-w-full">
          <div className="flex items-center justify-between gap-3">
            {/* Titolo episodio */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate text-white">
                {episodeName}
              </h1>
              <p className="text-xs text-slate-400 truncate">
                {playerName || 'Giocatore'}
              </p>
            </div>

            {/* GPS Status Indicator + Dropdown Profilo */}
            <div className="flex items-center gap-2">
              {/* Indicatore GPS (visibile solo su schermi non troppo piccoli) */}
              <GpsTrackingCircle />

              {/* Dropdown Profilo */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-800 flex-shrink-0"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-80 bg-slate-900 border-slate-700"
                >
                  <DropdownMenuLabel className="text-slate-300">
                    Profilo Episodio
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  {/* Statistiche Completamento */}
                  {stats && (
                    <div className="px-2 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Progressione</span>
                        <span className="text-sm font-bold text-amber-400">
                          {stats.completionPercentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>
                          {stats.nodesCompleted} / {stats.nodesTotal} nodi completati
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Effetti Attivi */}
                  {effects.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <div className="px-2 py-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          Effetti Attivi
                        </span>
                        <div className="mt-2 space-y-2">
                          {effects.map(effect => {
                            const config = getEffectConfig(effect.status_type);
                            if (!config) return null;

                            return (
                              <div
                                key={effect.status_effect_id}
                                className={`p-2 rounded-lg border ${
                                  EFFECT_COLOR_CLASSES[config.color]
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-lg">{config.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm truncate">
                                        {config.name}
                                      </div>
                                      <div className="text-xs opacity-80 truncate">
                                        {config.description}
                                      </div>
                                    </div>
                                  </div>
                                  {effect.expires_at && (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-[10px] bg-slate-800 text-slate-300 flex-shrink-0"
                                    >
                                      {timeRemaining[effect.status_effect_id] || '...'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {effects.length === 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <div className="px-2 py-3 text-center text-xs text-slate-500">
                        Nessun effetto attivo
                      </div>
                    </>
                  )}

                  {/* 🆕 SEZIONE GPS SETTINGS */}
                  <GpsSettingsMenu />

                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  {/* Link Profilo */}
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/player/profile"
                      className="cursor-pointer text-slate-300 hover:text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profilo Generale
                    </Link>
                  </DropdownMenuItem>

                  {/* Logout */}
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Seconda riga: Navigazione Main/Side */}
      <div className="bg-slate-800/50">
        <div className="container mx-auto px-3 max-w-full">
          <div className="grid grid-cols-2 gap-0">
            {/* Storia Principale */}
            <Link
              href={`/player/episodes/${episodeId}`}
              className={`py-3 text-center text-sm font-medium transition-colors border-b-2 ${
                isMainStory
                  ? 'text-amber-400 border-amber-400 bg-amber-500/5'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/30'
              }`}
            >
              Storia Principale
            </Link>

            {/* Storie Secondarie */}
            <Link
              href={`/player/episodes/${episodeId}/sidequests`}
              className={`py-3 text-center text-sm font-medium transition-colors border-b-2 ${
                isSideQuests
                  ? 'text-purple-400 border-purple-400 bg-purple-500/5'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/30'
              }`}
            >
              Storie Secondarie
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}