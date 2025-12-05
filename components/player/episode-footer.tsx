'use client';

import Link from 'next/link';
import { Home, Package, QrCode, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Props {
  episodeId: string;
  inventoryCount?: number;
  onScanQr?: () => void;
}

export function EpisodeFooter({ episodeId, inventoryCount = 0, onScanQr }: Props) {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-lg">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-4 gap-1 py-2">
          {/* Storia */}
          <Link 
            href={`/player/episodes/${episodeId}`}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              isActive(`/player/episodes/${episodeId}`) 
                ? 'text-amber-400 bg-amber-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Storia</span>
          </Link>
          
          {/* Inventario */}
          <Link
            href={`/player/episodes/${episodeId}/inventory`}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors relative ${
              isActive(`/player/episodes/${episodeId}/inventory`) 
                ? 'text-amber-400 bg-amber-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Package size={22} />
            <span className="text-[10px] font-medium">Inventario</span>
            {inventoryCount > 0 && (
              <span className="absolute top-1 right-1/4 bg-amber-500 text-slate-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {inventoryCount}
              </span>
            )}
          </Link>

          {/* Scan QR */}
          <button
            onClick={onScanQr}
            className="flex flex-col items-center gap-1 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            <QrCode size={22} />
            <span className="text-[10px] font-medium">Scan QR</span>
          </button>

          {/* Profilo */}
          <Link
            href={`/player/episodes/${episodeId}/profile`}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              isActive(`/player/episodes/${episodeId}/profile`) 
                ? 'text-amber-400 bg-amber-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profilo</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}