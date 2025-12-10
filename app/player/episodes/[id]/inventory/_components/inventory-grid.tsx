'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ItemActionMenu } from '@/components/player/item-action-menu';
import Image from 'next/image';
import { Package } from 'lucide-react';

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
  inventory: InventoryItem[];
  episodeId: string;
  onItemConsumed?: () => void;
}

const rarityColors = {
  common: 'from-slate-500 to-slate-600',
  uncommon: 'from-green-500 to-emerald-600',
  rare: 'from-blue-500 to-cyan-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-amber-500 to-orange-600'
};

export function InventoryGrid({ inventory, episodeId, onItemConsumed }: Props) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleConsume = async (itemId: string) => {
    // TODO: Implementare consumo item con applicazione effetti
    console.log('Consuming item:', itemId);
    
    // Per ora solo alert
    alert('Funzionalità "Consuma" in sviluppo - verrà collegata al sistema status effects');
    
    // Callback per refresh inventario
    if (onItemConsumed) {
      onItemConsumed();
    }
  };

  if (inventory.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 sm:p-12 text-center text-slate-400">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg">Inventario vuoto</p>
          <p className="text-xs sm:text-sm mt-2">Scansiona QR code per raccogliere oggetti</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-4">
        {inventory.map((invItem) => (
          <Card
            key={invItem.item_id}
            className="bg-slate-800/80 border-slate-700 hover:bg-slate-800 cursor-pointer transition-all hover:scale-105 active:scale-95"
            onClick={() => setSelectedItem(invItem)}
          >
            <CardContent className="p-2 sm:p-3">
              {/* Item Image with Rarity Border */}
              <div className={`relative w-full aspect-square rounded-lg mb-1 sm:mb-2 bg-gradient-to-br ${
                rarityColors[invItem.item.rarity as keyof typeof rarityColors]
              } p-0.5 sm:p-1`}>
                <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                  {invItem.item.icon_url ? (
                    <Image
                      src={invItem.item.icon_url}
                      alt={invItem.item.name}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  ) : (
                    <Package className="w-6 h-6 sm:w-10 sm:h-10 text-slate-500" />
                  )}
                </div>
                
                {/* Quantity Badge */}
                {invItem.quantity > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-900 font-bold text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border border-slate-900">
                    {invItem.quantity}
                  </div>
                )}

                {/* Equipped Badge */}
                {invItem.is_equipped && (
                  <div className="absolute -top-1 -left-1 bg-green-500 text-white font-bold text-[10px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border border-slate-900">
                    ✓
                  </div>
                )}
              </div>

              {/* Item Name */}
              <h3 className="text-[10px] sm:text-xs font-semibold text-white text-center truncate leading-tight">
                {invItem.item.name}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Action Menu - Sostituisce il vecchio ItemDetailDialog */}
      <ItemActionMenu
        item={selectedItem}
        episodeId={episodeId}
        onClose={() => setSelectedItem(null)}
        onConsume={handleConsume}
      />
    </>
  );
}