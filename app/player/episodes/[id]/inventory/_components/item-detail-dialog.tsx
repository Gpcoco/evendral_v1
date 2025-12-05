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
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold pr-6">{item.item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Image - Ridotta */}
          <div className={`w-full max-w-[200px] sm:max-w-[250px] mx-auto aspect-square rounded-lg bg-gradient-to-br ${
            rarityColors[item.item.rarity as keyof typeof rarityColors]
          } p-2`}>
            <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
              {item.item.icon_url ? (
                <Image
                  src={item.item.icon_url}
                  alt={item.item.name}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              ) : (
                <Package className="w-20 h-20 text-slate-500" />
              )}
            </div>
          </div>

          {/* Description */}
          {item.item.description && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Descrizione</h4>
              <p className="text-sm text-slate-200">{item.item.description}</p>
            </div>
          )}

          {/* Stats Grid - Compatta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Rarità</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${
                rarityColors[item.item.rarity as keyof typeof rarityColors]
              } text-white inline-flex items-center gap-1`}>
                <Sparkles className="w-3 h-3" />
                {item.item.rarity}
              </span>
            </div>

            {item.item.category && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Categoria</h4>
                <p className="text-sm text-slate-200 truncate">{item.item.category}</p>
              </div>
            )}

            {item.item.base_value !== null && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Valore</h4>
                <p className="text-sm text-slate-200 font-bold">{item.item.base_value}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Quantità</h4>
              <p className="text-sm text-slate-200 font-bold">{item.quantity}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Stackable</h4>
              <p className={`text-sm ${item.item.is_stackable ? 'text-green-400' : 'text-slate-500'}`}>
                {item.item.is_stackable ? '✓ Sì' : '✗ No'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-1">Consumabile</h4>
              <p className={`text-sm ${item.item.is_consumable ? 'text-green-400' : 'text-slate-500'}`}>
                {item.item.is_consumable ? '✓ Sì' : '✗ No'}
              </p>
            </div>

            {item.is_equipped && (
              <div className="col-span-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 border border-green-500/30 text-green-400 inline-block">
                  ✓ Equipaggiato
                </span>
              </div>
            )}
          </div>

          {/* Acquired Date - Compatta */}
          <div className="text-xs text-slate-500 text-center pt-3 border-t border-slate-800">
            Acquisito il {new Date(item.acquired_at).toLocaleDateString('it-IT', {
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