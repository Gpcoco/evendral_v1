'use client';

import { useState } from 'react';
import { ArrowLeft, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { QrScannerDialog } from '../../_components/qr-scanner-dialog';

interface Props {
  episodeId: string;
  episodeName: string;
  playerId: string;
}

export function ExchangeView({ episodeId, episodeName, playerId }: Props) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/player/episodes/${episodeId}/inventory`}>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Scambio</h1>
              <p className="text-sm text-slate-400">{episodeName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <QRCodeSVG 
              value={playerId}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Player Info */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Il tuo codice giocatore</p>
            <p className="text-xs text-slate-600 font-mono">{playerId}</p>
          </div>

          {/* Scan Button */}
          <Button 
            size="lg"
            onClick={() => setShowScanner(true)}
            className="w-full max-w-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
          >
            <ScanLine className="w-5 h-5 mr-2" />
            Leggi codice dell altro giocatore
          </Button>
        </div>
      </main>

      {/* QR Scanner Dialog */}
      <QrScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        playerId={playerId}
        episodeId={episodeId}
      />
    </div>
  );
}