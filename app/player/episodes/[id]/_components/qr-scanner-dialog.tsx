'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';
import { addItemFromQr } from '@/lib/actions/qr-item-actions';
import { createExchangeSession } from '@/lib/actions/exchange-actions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Users } from 'lucide-react';

interface ScanResult {
  success: boolean;
  message: string;
  type: 'item' | 'player';
  item?: {
    name: string;
    description: string | null;
  };
  sessionId?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  episodeId: string;
}

export function QrScannerDialog({ open, onOpenChange, playerId, episodeId }: Props) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessing = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (open && !scannerRef.current) {
      // Aspetta che il dialog sia completamente renderizzato
      setTimeout(() => {
        startScanner();
      }, 300);
    }
    
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startScanner = async () => {
    try {
      setScanning(true);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        () => {} // Ignora errori di scan continui
      );
    } catch (err) {
      console.error("Errore avvio scanner:", err);
      setResult({ 
        success: false, 
        message: 'Impossibile accedere alla camera',
        type: 'item'
      });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Errore stop scanner:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Previeni scansioni multiple
    if (isProcessing.current) return;
    isProcessing.current = true;

    await stopScanner();

    // Verifica se è un UUID valido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(decodedText)) {
      setResult({ 
        success: false, 
        message: 'QR code non valido',
        type: 'item'
      });
      isProcessing.current = false;
      return;
    }

    // Determina se è un player_id o item_id
    const scanResult = await handleQrScan(decodedText);
    setResult(scanResult);
    
    // Se è un player e lo scambio è creato, reindirizza automaticamente
    if (scanResult.success && scanResult.type === 'player' && scanResult.sessionId) {
      setTimeout(() => {
        router.push(`/player/episodes/${episodeId}/exchange/session/${scanResult.sessionId}`);
      }, 1500);
    }
    
    isProcessing.current = false;
  };

  const handleQrScan = async (scannedId: string): Promise<ScanResult> => {
    // Prima prova a vedere se è un player_id
    const exchangeResult = await createExchangeSession(episodeId, playerId, scannedId);
    
    if (exchangeResult.success) {
      return {
        success: true,
        type: 'player',
        message: 'Giocatore trovato! Avvio sessione di scambio...',
        sessionId: exchangeResult.sessionId
      };
    }

    // Se non è un player, prova come item_id
    const itemResult = await addItemFromQr(scannedId, playerId, episodeId);
    
    return {
      success: itemResult.success,
      type: 'item',
      message: itemResult.message,
      item: itemResult.item
    };
  };

  const handleClose = () => {
    stopScanner();
    setResult(null);
    isProcessing.current = false;
    onOpenChange(false);
  };

  const handleScanAgain = () => {
    setResult(null);
    isProcessing.current = false;
    startScanner();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            📷 Scansiona QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result && (
            <>
              <div 
                id="qr-reader" 
                className="w-full rounded-lg overflow-hidden bg-black"
              />
              {scanning && (
                <p className="text-center text-sm text-slate-400">
                  Inquadra il QR code di un oggetto o di un altro giocatore...
                </p>
              )}
            </>
          )}

          {result && (
            <div className="text-center py-8">
              {result.success ? (
                <>
                  {result.type === 'item' ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-400 mb-2">
                        Oggetto Trovato!
                      </h3>
                      {result.item && (
                        <p className="text-lg mb-4">🎁 {result.item.name}</p>
                      )}
                      <p className="text-slate-300 mb-6">{result.message}</p>
                    </>
                  ) : (
                    <>
                      <Users className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-amber-400 mb-2">
                        Giocatore Trovato!
                      </h3>
                      <p className="text-slate-300 mb-6">{result.message}</p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-400 mb-2">
                    Errore
                  </h3>
                  <p className="text-slate-300 mb-6">{result.message}</p>
                </>
              )}
              
              {/* Mostra pulsanti solo se non sta per reindirizzare */}
              {!(result.success && result.type === 'player') && (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleScanAgain}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Scansiona Altro
                  </Button>
                  <Button 
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Chiudi
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}