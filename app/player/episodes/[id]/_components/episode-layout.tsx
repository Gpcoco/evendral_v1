'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeContent } from './node-content';
import { QrScannerDialog } from './qr-scanner-dialog';
import { EpisodeFooter } from '@/components/player/episode-footer';
import { Target } from 'lucide-react';
import Link from 'next/link';
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
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-3 py-3 max-w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate">{episode.name}</h1>
              <p className="text-xs text-slate-400 truncate">{player.display_name}</p>
            </div>
            
            {/* Side Quests Button */}
            <Link href={`/player/episodes/${episodeId}/sidequests`}>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 flex-shrink-0 h-8 px-2"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline text-xs ml-1">Side</span>
              </Button>
            </Link>
            
            {/* Player Stats - Compact on mobile */}
            <div className="flex items-center gap-2 text-xs flex-shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Lv</div>
                <div className="font-bold text-amber-400">{player.level}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">XP</div>
                <div className="font-bold text-blue-400 text-xs">{player.experience_points}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

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