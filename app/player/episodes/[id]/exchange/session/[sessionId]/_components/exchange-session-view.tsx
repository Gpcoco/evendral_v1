'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Users, CheckCircle, Clock, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayerCard } from './player-card';
import { InventorySelector } from './inventory-selector';
import { selectItemForExchange, confirmExchange, cancelExchangeSession } from '@/lib/actions/exchange-actions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Player {
  player_id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  experience: number;
}

interface Item {
  item_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rarity: string;
}

interface ItemReference {
  item: Item;
}

interface ExchangeSessionData {
  session_id: string;
  episode_id: string;
  player_a_id: string;
  player_b_id: string;
  player_a_item_id: string | null;
  player_b_item_id: string | null;
  player_a_confirmed: boolean;
  player_b_confirmed: boolean;
  status: 'active' | 'completed' | 'cancelled';
  player_a: Player;
  player_b: Player;
  player_a_item: ItemReference | null;
  player_b_item: ItemReference | null;
}

interface InventoryItem {
  player_id: string;
  item_id: string;
  episode_id: string;
  quantity: number;
  durability: number | null;
  is_equipped: boolean;
  was_brought_from_stash: boolean;
  acquired_at: string;
  custom_data: Record<string, unknown>;
  item: Item;
}

interface Props {
  sessionId: string;
  episodeId: string;
  localPlayerId: string;
  initialSession: ExchangeSessionData;
  inventory: InventoryItem[];
}

export function ExchangeSessionView({ 
  sessionId, 
  episodeId, 
  localPlayerId, 
  initialSession,
  inventory 
}: Props) {
  const [session, setSession] = useState<ExchangeSessionData>(initialSession);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Determina se il giocatore locale è A o B
  const isPlayerA = localPlayerId === session.player_a_id;
  const localPlayer = isPlayerA ? session.player_a : session.player_b;
  const remotePlayer = isPlayerA ? session.player_b : session.player_a;
  const localItemId = isPlayerA ? session.player_a_item_id : session.player_b_item_id;
  const remoteItemId = isPlayerA ? session.player_b_item_id : session.player_a_item_id;
  const localConfirmed = isPlayerA ? session.player_a_confirmed : session.player_b_confirmed;
  const remoteConfirmed = isPlayerA ? session.player_b_confirmed : session.player_a_confirmed;

  // Setup Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`exchange_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'exchange_sessions',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setSession(payload.new as ExchangeSessionData);
          
          // Se lo stato diventa completed, reindirizza all'inventario
          if ((payload.new as ExchangeSessionData).status === 'completed') {
            setTimeout(() => {
              router.push(`/player/episodes/${episodeId}/inventory`);
            }, 2000);
          }
          
          // Se lo stato diventa cancelled, reindirizza
          if ((payload.new as ExchangeSessionData).status === 'cancelled') {
            router.push(`/player/episodes/${episodeId}/inventory`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, episodeId, router]);

  // Gestisci selezione item
  const handleSelectItem = async (itemId: string) => {
    setError(null);
    setSelectedItemId(itemId);
    
    const result = await selectItemForExchange(sessionId, localPlayerId, itemId, episodeId);
    
    if (!result.success) {
      setError(result.error || 'Errore durante la selezione');
      setSelectedItemId(null);
    }
  };

  // Gestisci conferma scambio
  const handleConfirm = async () => {
    setError(null);
    setIsConfirming(true);
    
    const result = await confirmExchange(sessionId, localPlayerId);
    
    if (!result.success) {
      setError(result.error || 'Errore durante la conferma');
      setIsConfirming(false);
    }
  };

  // Gestisci annullamento
  const handleCancel = async () => {
    await cancelExchangeSession(sessionId);
    router.push(`/player/episodes/${episodeId}/inventory`);
  };

  // Determina lo stato del pulsante
  const canConfirm = localItemId && remoteItemId && !localConfirmed;
  const waitingForOther = localConfirmed && !remoteConfirmed;
  const bothConfirmed = localConfirmed && remoteConfirmed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/player/episodes/${episodeId}/inventory`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 hover:text-white"
                  onClick={handleCancel}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Sessione di Scambio
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sessione completata */}
        {session.status === 'completed' && (
          <Alert className="bg-green-900/20 border-green-700">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Scambio completato con successo! Reindirizzamento in corso...
            </AlertDescription>
          </Alert>
        )}

        {/* Remote Player Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Giocatore Remoto
          </h2>
          <PlayerCard
            player={remotePlayer}
            selectedItem={remoteItemId ? (isPlayerA ? session.player_b_item : session.player_a_item) : null}
            status={
              remoteConfirmed ? 'confirmed' : 
              remoteItemId ? 'selected' : 
              'waiting'
            }
          />
        </div>

        {/* Exchange Button */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center">
            <Button
              size="lg"
              disabled={!canConfirm || isConfirming || bothConfirmed}
              onClick={handleConfirm}
              className={`
                px-8 py-6 text-lg font-bold shadow-lg
                ${bothConfirmed 
                  ? 'bg-green-600 hover:bg-green-600' 
                  : waitingForOther 
                    ? 'bg-blue-600 hover:bg-blue-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                }
              `}
            >
              {bothConfirmed ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Scambio in corso...
                </>
              ) : waitingForOther ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-pulse" />
                  In attesa dell altro giocatore
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                  SCAMBIA
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Local Player Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Il Tuo Profilo
          </h2>
          <PlayerCard
            player={localPlayer}
            selectedItem={localItemId ? (isPlayerA ? session.player_a_item : session.player_b_item) : null}
            status={
              localConfirmed ? 'confirmed' : 
              localItemId ? 'selected' : 
              'waiting'
            }
          />
        </div>

        {/* Inventory Selector */}
        {!localConfirmed && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Seleziona un oggetto da scambiare
            </h2>
            <InventorySelector
              inventory={inventory}
              selectedItemId={selectedItemId || localItemId}
              onSelectItem={handleSelectItem}
            />
          </div>
        )}
      </main>
    </div>
  );
}