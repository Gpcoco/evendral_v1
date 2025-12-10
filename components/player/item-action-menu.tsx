'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  ArrowLeftRight, 
  Sparkles, 
  Grid3x3,
  Lock 
} from 'lucide-react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { useState } from 'react';
import { ItemDetailDialog } from './item-detail-dialog';
import { useRouter } from 'next/navigation';

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
  episodeId: string;
  onClose: () => void;
  onConsume?: (itemId: string) => void;
}

const rarityColors = {
  common: 'from-slate-500 to-slate-600',
  uncommon: 'from-green-500 to-emerald-600',
  rare: 'from-blue-500 to-cyan-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-amber-500 to-orange-600'
};

export function ItemActionMenu({ item, episodeId, onClose, onConsume }: Props) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  if (!item) return null;

  const handleDetails = () => {
    setShowDetails(true);
  };

  const handleExchange = () => {
    // Salva item selezionato per pre-compilare lo scambio
    sessionStorage.setItem('exchange_preselected_item', item.item_id);
    router.push(`/player/episodes/${episodeId}/exchange`);
    onClose();
  };

  const handleConsume = () => {
    if (onConsume) {
      onConsume(item.item_id);
      onClose();
    }
  };

  const handleCombine = () => {
    // TODO: Implementare crafting system
    alert('Funzionalità in sviluppo');
  };

  return (
    <>
      <Sheet open={!!item} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className="bg-slate-900 border-slate-700 text-white rounded-t-3xl"
        >
          <SheetHeader className="space-y-4">
            {/* Item Preview */}
            <div className="flex items-center gap-4 py-2">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                rarityColors[item.item.rarity as keyof typeof rarityColors]
              } p-1 flex-shrink-0`}>
                <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                  {item.item.icon_url ? (
                    <Image
                      src={item.item.icon_url}
                      alt={item.item.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-500" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-bold truncate">
                  {item.item.name}
                </SheetTitle>
                <SheetDescription className="text-slate-400 text-sm">
                  {item.item.category || 'Oggetto'} • x{item.quantity}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 pb-6">
            {/* Dettagli */}
            <Button
              onClick={handleDetails}
              className="h-auto flex flex-col gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Info className="w-6 h-6" />
              <span className="text-sm font-semibold">Dettagli</span>
            </Button>

            {/* Scambia */}
            <Button
              onClick={handleExchange}
              className="h-auto flex flex-col gap-2 py-4 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <ArrowLeftRight className="w-6 h-6" />
              <span className="text-sm font-semibold">Scambia</span>
            </Button>

            {/* Consuma/Usa */}
            <Button
              onClick={handleConsume}
              disabled={!item.item.is_consumable}
              className="h-auto flex flex-col gap-2 py-4 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-700 disabled:text-slate-500"
            >
              {item.item.is_consumable ? (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm font-semibold">Consuma</span>
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  <span className="text-sm font-semibold">Non consumabile</span>
                </>
              )}
            </Button>

            {/* Usa con... (Crafting) */}
            <Button
              onClick={handleCombine}
              disabled={true}
              className="h-auto flex flex-col gap-2 py-4 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-700 disabled:text-slate-500"
            >
              <Grid3x3 className="w-6 h-6" />
              <span className="text-sm font-semibold">Usa con...</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Item Detail Dialog - aperto dal pulsante Dettagli */}
      {showDetails && (
        <ItemDetailDialog
          item={item}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}