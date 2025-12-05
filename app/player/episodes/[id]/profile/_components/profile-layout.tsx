'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EpisodeFooter } from '@/components/player/episode-footer';
import { QrScannerDialog } from '../../_components/qr-scanner-dialog';
import { User, Zap, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Player {
  player_id: string;
  display_name: string | null;
  level: number;
  experience_points: number;
  user_id: string;
  created_at: string;
}

interface StatusEffect {
  status_effect_id: string;
  status_type: string;
  applied_at: string;
  expires_at: string | null;
  metadata: Record<string, unknown>; // ← Cambiato da any a unknown
}

interface EpisodeStats {
  player_id: string;
  episode_id: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  episodeId: string;
  episodeName: string;
  player: Player;
  statusEffects: StatusEffect[];
  episodeStats: EpisodeStats | null;
  inventoryCount: number;
}

export function ProfileLayout({ 
  episodeId, 
  episodeName, 
  player, 
  statusEffects, 
  episodeStats,
  inventoryCount 
}: Props) {
  const [showScanner, setShowScanner] = useState(false);

  // Calculate XP progress to next level
  const xpForNextLevel = player.level * 100; // Esempio: 100 XP per livello
  const xpProgress = (player.experience_points % xpForNextLevel) / xpForNextLevel * 100;
  const xpCurrent = player.experience_points % xpForNextLevel;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Profilo Giocatore</h1>
            <p className="text-sm text-slate-400">{episodeName}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Player Info Card */}
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-bold">
                {player.display_name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{player.display_name || 'Giocatore'}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Livello {player.level}
                  </span>
                  <span className="text-sm text-slate-400">
                    {player.experience_points} XP totali
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progresso Livello {player.level + 1}</span>
                <span className="text-amber-400 font-semibold">{xpCurrent} / {xpForNextLevel} XP</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Episode Stats Card */}
        {episodeStats && (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-blue-400" />
                Statistiche Episodio
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Inizio Avventura</p>
                <p className="text-white font-semibold">
                  {new Date(episodeStats.created_at).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Ultimo Aggiornamento</p>
                <p className="text-white font-semibold">
                  {new Date(episodeStats.updated_at).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Status Effects Card */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Effetti Attivi ({statusEffects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusEffects.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun effetto attivo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statusEffects.map((effect) => (
                  <div 
                    key={effect.status_effect_id}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white capitalize">
                        {effect.status_type.replace(/_/g, ' ')}
                      </h4>
                      {effect.expires_at ? (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                          Scade: {new Date(effect.expires_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                          Permanente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Applicato: {new Date(effect.applied_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {effect.metadata && Object.keys(effect.metadata).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-500">
                          {JSON.stringify(effect.metadata)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4 text-center">
              <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">Lv {player.level}</div>
              <div className="text-xs text-slate-400">Livello Corrente</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{statusEffects.length}</div>
              <div className="text-xs text-slate-400">Effetti Attivi</div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <EpisodeFooter 
        episodeId={episodeId}
        inventoryCount={inventoryCount}
        onScanQr={() => setShowScanner(true)}
      />

      {/* QR Scanner Dialog */}
      <QrScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        playerId={player.player_id}
        episodeId={episodeId}
      />
    </div>
  );
}