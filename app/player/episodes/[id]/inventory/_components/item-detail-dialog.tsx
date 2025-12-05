'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Package, Sparkles } from 'lucide-react';

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
    category: string | null;
    base_value: number | null;
    is_stackable: boolean;
    is_consumable: boolean;
  };
}

interface Props {
  item: InventoryItem | null;
  onClose: () => void;
}

const rarityColors = {
  common: 'from-slate-500 to-slate-600',
  uncommon: 'from-green-500 to-emerald-600',
  rare: 'from-blue-500 to-cyan-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-amber-500 to-orange-600'
};

export function ItemDetailDialog({ item, onClose }: Props) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md p-4 sm:p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold pr-6 truncate">
            {item.item.name}
          </DialogTitle>
        </DialogHeader>

        {/* Fixed height container - no scroll */}
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* Item Image - Fixed size */}
          <div className={`w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-lg bg-gradient-to-br ${
            rarityColors[item.item.rarity as keyof typeof rarityColors]
          } p-1.5 flex-shrink-0`}>
            <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
              {item.item.icon_url ? (
                <Image
                  src={item.item.icon_url}
                  alt={item.item.name}
                  width={160}
                  height={160}
                  className="object-contain"
                />
              ) : (
                <Package className="w-16 h-16 text-slate-500" />
              )}
            </div>
          </div>

          {/* Two columns layout */}
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
            {/* Left column - Description (scrollable) */}
            <div className="flex flex-col min-h-0">
              <h4 className="text-xs font-semibold text-slate-400 mb-1 flex-shrink-0">Descrizione</h4>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                <p className="text-xs sm:text-sm text-slate-200">
                  {item.item.description || 'Nessuna descrizione disponibile'}
                </p>
              </div>
            </div>

            {/* Right column - Stats (no scroll) */}
            <div className="flex flex-col gap-2 text-xs">
              <div>
                <h4 className="text-[10px] font-semibold text-slate-400 mb-0.5">Rarità</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${
                  rarityColors[item.item.rarity as keyof typeof rarityColors]
                } text-white inline-flex items-center gap-1`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.item.rarity}
                </span>
              </div>

              {item.item.category && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 mb-0.5">Categoria</h4>
                  <p className="text-xs text-slate-200 truncate">{item.item.category}</p>
                </div>
              )}

              {item.item.base_value !== null && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 mb-0.5">Valore</h4>
                  <p className="text-xs text-slate-200 font-bold">{item.item.base_value}</p>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-semibold text-slate-400 mb-0.5">Quantità</h4>
                <p className="text-xs text-slate-200 font-bold">{item.quantity}</p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 mb-0.5">Stack</h4>
                  <p className={`text-xs ${item.item.is_stackable ? 'text-green-400' : 'text-slate-500'}`}>
                    {item.item.is_stackable ? '✓' : '✗'}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 mb-0.5">Cons.</h4>
                  <p className={`text-xs ${item.item.is_consumable ? 'text-green-400' : 'text-slate-500'}`}>
                    {item.item.is_consumable ? '✓' : '✗'}
                  </p>
                </div>
              </div>

              {item.is_equipped && (
                <div className="mt-auto">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 border border-green-500/30 text-green-400 inline-block">
                    ✓ Equipaggiato
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-800 flex-shrink-0">
            Acquisito: {new Date(item.acquired_at).toLocaleDateString('it-IT', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}