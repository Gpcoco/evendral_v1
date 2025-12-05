'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';

interface Item {
  item_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rarity: string;
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
  inventory: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

const rarityColors = {
  common: 'border-slate-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-orange-500',
};

export function InventorySelector({ inventory, selectedItemId, onSelectItem }: Props) {
  if (inventory.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Nessun oggetto disponibile nell'inventario</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {inventory.map((item) => {
        const isSelected = selectedItemId === item.item_id;
        
        return (
          <button
            key={item.item_id}
            onClick={() => onSelectItem(item.item_id)}
            className={`
              relative aspect-square rounded-lg overflow-hidden border-2 transition-all
              ${isSelected 
                ? 'border-amber-400 ring-2 ring-amber-400/50 scale-95' 
                : `${rarityColors[item.item.rarity as keyof typeof rarityColors] || rarityColors.common} hover:scale-105`
              }
            `}
          >
            {/* Item Image */}
            <div className="relative w-full h-full bg-slate-800">
              {item.item.image_url ? (
                <Image
                  src={item.item.image_url}
                  alt={item.item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
              )}
            </div>

            {/* Quantity Badge */}
            {item.quantity > 1 && (
              <div className="absolute top-1 right-1 bg-slate-900/90 px-2 py-0.5 rounded text-xs font-bold">
                {item.quantity}
              </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                <div className="bg-amber-500 rounded-full p-2">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            {/* Item Name Tooltip */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900 to-transparent p-2">
              <p className="text-xs font-semibold truncate">{item.item.name}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}