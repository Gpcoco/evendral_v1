'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeContent } from './node-content';
import { InventoryDialog } from './inventory-dialog';
import { Home, Package, Target } from 'lucide-react';
import Link from 'next/link';
import type { Episode, ContentNode } from '@/lib/types/database';

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

interface Player {
  player_id: string;
  display_name: string | null;
  level: number;
  experience_points: number;
}

interface Props {
  episode: Episode;
  player: Player;
  nodes: ContentNode[];
  inventory: InventoryItem[];
  episodeId: string;
}


export function EpisodeLayout({ episode, player, nodes, inventory, episodeId }: Props) {
  const [showInventory, setShowInventory] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-20">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-bold truncate">{episode.name}</h1>
              <p className="text-xs text-slate-400">{player.display_name}</p>
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
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Target size={24} />
              <span className="text-xs">Obiettivi</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Inventory Dialog */}
      <InventoryDialog 
        inventory={inventory}
        open={showInventory}
        onOpenChange={setShowInventory}
      />
    </div>
  );
}