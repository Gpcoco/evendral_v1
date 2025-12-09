'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeContent } from '../../_components/node-content';
import { InventoryDialog } from '../../_components/inventory-dialog';
import { QrScannerDialog } from '../../_components/qr-scanner-dialog';
import { Home, Package, QrCode, ArrowLeft } from 'lucide-react';
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

export function SideQuestsLayout({ episode, player, nodes, inventory, episodeId }: Props) {
  const [showInventory, setShowInventory] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-20">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/player/episodes/${episodeId}`}>
                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white -ml-2">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <h1 className="text-lg font-bold">Side Quests</h1>
              </div>
              <p className="text-xs text-slate-400">{episode.name}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="text-xs text-slate-400">Level</div>
                <div className="font-bold text-amber-400">{player.level}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">XP</div>
                <div className="font-bold text-blue-400">{player.experience_points}</div>
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
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-lg mb-2">Nessuna Side Quest disponibile</p>
              <p className="text-sm text-slate-500">Completa la storia principale per sbloccare missioni secondarie</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-300">
                ⭐ <strong className="text-amber-400">{nodes.length}</strong> missioni secondarie disponibili
              </p>
            </div>
            
            {nodes.map((node, index) => (
              <Card 
                key={node.node_id}
                className="bg-slate-800/80 border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <span className="text-lg">🗺️</span>
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
            ))}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link 
              href="/player/profile"
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Home size={24} />
              <span className="text-xs">Home</span>
            </Link>
            
            <button
              onClick={() => setShowInventory(true)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors relative"
            >
              <Package size={24} />
              <span className="text-xs">Inventario</span>
              {inventory.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {inventory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowScanner(true)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <QrCode size={24} />
              <span className="text-xs">Scan QR</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Dialogs */}
      <InventoryDialog 
        inventory={inventory}
        open={showInventory}
        onOpenChange={setShowInventory}
      />
      
      <QrScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        playerId={player.player_id}
        episodeId={episodeId}
      />
    </div>
  );
}