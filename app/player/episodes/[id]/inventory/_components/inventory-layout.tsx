'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EpisodeFooter } from '@/components/player/episode-footer';
import { QrScannerDialog } from '../../_components/qr-scanner-dialog';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

interface Props {
  episodeId: string;
  episodeName: string;
  inventoryCount: number;
  children: React.ReactNode;
}

export function InventoryLayout({ episodeId, episodeName, inventoryCount, children }: Props) {
  const [showScanner, setShowScanner] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    async function getPlayer() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('player')
          .select('player_id')
          .eq('user_id', user.id)
          .single();
        if (data) setPlayerId(data.player_id);
      }
    }
    getPlayer();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/player/episodes/${episodeId}`}>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Inventario</h1>
              <p className="text-sm text-slate-400">{episodeName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <EpisodeFooter 
        episodeId={episodeId}
        inventoryCount={inventoryCount}
        onScanQr={() => setShowScanner(true)}
      />

      {/* QR Scanner Dialog */}
      {playerId && (
        <QrScannerDialog
          open={showScanner}
          onOpenChange={setShowScanner}
          playerId={playerId}
          episodeId={episodeId}
        />
      )}
    </div>
  );
}