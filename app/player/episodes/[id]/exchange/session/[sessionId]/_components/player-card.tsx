'use client';

import { CheckCircle, Clock, User } from 'lucide-react';
import Image from 'next/image';

interface Props {
  player: {
    name: string;
    avatar_url: string | null;
    level: number;
  };
  selectedItem: {
    item: {
      name: string;
      image_url: string | null;
      rarity: string;
    };
  } | null;
  status: 'waiting' | 'selected' | 'confirmed';
}

const statusConfig = {
  waiting: {
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-700/50',
    label: 'In attesa...'
  },
  selected: {
    icon: CheckCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    label: 'Oggetto selezionato'
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    label: 'Confermato'
  }
};

const rarityColors = {
  common: 'border-slate-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-orange-500',
};

export function PlayerCard({ player, selectedItem, status }: Props) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
      {/* Player Info */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
          {player.avatar_url ? (
            <Image
              src={player.avatar_url}
              alt={player.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-slate-500" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{player.name}</h3>
          <p className="text-sm text-slate-400">Livello {player.level}</p>
        </div>

        {/* Status Indicator */}
        <div className={`${config.bgColor} px-3 py-2 rounded-lg flex items-center gap-2`}>
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Selected Item */}
      {selectedItem && (
        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
            Oggetto Proposto
          </p>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
              rarityColors[selectedItem.item.rarity as keyof typeof rarityColors] || rarityColors.common
            }`}>
              {selectedItem.item.image_url ? (
                <Image
                  src={selectedItem.item.image_url}
                  alt={selectedItem.item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{selectedItem.item.name}</h4>
              <p className="text-xs text-slate-400 capitalize">{selectedItem.item.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}