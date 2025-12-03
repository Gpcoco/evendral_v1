'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
  inventory: InventoryItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rarityColors: Record<string, string> = {
  common: 'bg-slate-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-amber-500',
};

export function InventoryDialog({ inventory, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            🎒 Il Tuo Inventario
          </DialogTitle>
        </DialogHeader>
        
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-slate-400">Il tuo inventario è vuoto</p>
            <p className="text-sm text-slate-500 mt-2">Completa obiettivi per ottenere oggetti</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {inventory.map((item) => (
              <Card 
                key={item.item_id} 
                className="bg-slate-800/80 border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <div className="p-4 flex gap-4">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-slate-700/50 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    {item.item.icon_url ? (
                      <Image 
                        src={item.item.icon_url} 
                        alt={item.item.name} 
                        width={64}
                        height={64}
                        className="object-contain" 
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white truncate">{item.item.name}</h3>
                      <Badge className="bg-slate-700 text-white shrink-0">
                        x{item.quantity}
                      </Badge>
                    </div>
                    
                    {item.item.description && (
                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                        {item.item.description}
                      </p>
                    )}
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        className={`${rarityColors[item.item.rarity] || 'bg-slate-500'} text-white`}
                      >
                        {item.item.rarity}
                      </Badge>
                      {item.is_equipped && (
                        <Badge className="bg-emerald-500 text-white">
                          ⚔️ Equipaggiato
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}