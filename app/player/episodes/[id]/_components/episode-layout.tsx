'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeContent } from './node-content';
import { QrScannerDialog } from './qr-scanner-dialog';
import { EpisodeFooter } from '@/components/player/episode-footer';
import { EpisodeHeader } from '@/components/player/episode-header';
import type { Episode, ContentNode } from '@/lib/types/database';

interface Player {
  player_id: string;
  display_name: string | null;
  level: number;
  experience_points: number;
}

interface InventoryItem {
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  acquired_at: string;
  item: {
    name: string;
    description: string | null;
    icon_url: string | null;
    rarity: string;
  };
}

interface Props {
  episode: Episode;
  player: Player;
  nodes: ContentNode[];
  inventory: InventoryItem[];
  episodeId: string;
}

export function EpisodeLayout({ episode, player, nodes, inventory, episodeId }: Props) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-20 overflow-x-hidden">
      {/* Nuovo Header a due righe */}
      <EpisodeHeader
        episodeId={episodeId}
        episodeName={episode.name}
        playerId={player.player_id}
        playerName={player.display_name}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-4">
        {nodes.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center text-slate-400">
              🔒 Completa i requisiti per sbloccare nuovi contenuti
            </CardContent>
          </Card>
        ) : (
          nodes.map((node, index) => (
            <Card 
              key={node.node_id}
              className="bg-slate-800/80 border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <span className="text-lg">📜</span>
                  {node.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-200">
                <NodeContent 
                  content={node.content_html}
                  playerId={player.player_id}
                  episodeId={episodeId}
                  nodeId={node.node_id} 
                />
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {/* Footer */}
      <EpisodeFooter 
        episodeId={episodeId}
        inventoryCount={inventory.length}
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