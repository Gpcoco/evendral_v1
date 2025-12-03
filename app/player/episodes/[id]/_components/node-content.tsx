'use client';

import { useEffect, useRef } from 'react';
import { validateCodeEntry, validateGpsLocation, validateQrCode } from '@/lib/actions/target-validation-actions';

interface Props {
  content: string;
  playerId: string;
  episodeId: string;
}

interface WindowWithTargetFunctions extends Window {
  submitTargetCode?: (targetId: string, code: string) => Promise<{success: boolean, message: string}>;
  submitGpsLocation?: (targetId: string, lat: number, lng: number) => Promise<{success: boolean, message: string}>;
  submitQrCode?: (targetId: string, qrCode: string) => Promise<{success: boolean, message: string}>;
  requestGeolocation?: () => Promise<{lat: number, lng: number} | null>;
}

export function NodeContent({ content, playerId, episodeId }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = window as WindowWithTargetFunctions;
    
    // Code entry
    win.submitTargetCode = async (targetId: string, code: string) => {
      return await validateCodeEntry(targetId, code, playerId, episodeId);
    };

    // GPS location
    win.submitGpsLocation = async (targetId: string, lat: number, lng: number) => {
      return await validateGpsLocation(targetId, lat, lng, playerId, episodeId);
    };

    // QR code
    win.submitQrCode = async (targetId: string, qrCode: string) => {
      return await validateQrCode(targetId, qrCode, playerId, episodeId);
    };

    // Helper per geolocalizzazione
    win.requestGeolocation = async () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          alert('Geolocation not supported');
          resolve(null);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            alert(`GPS Error: ${error.message}`);
            resolve(null);
          }
        );
      });
    };

    // Esegui script inline
    if (contentRef.current) {
      const scripts = contentRef.current.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        newScript.text = script.text;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      });
    }

    return () => {
      delete win.submitTargetCode;
      delete win.submitGpsLocation;
      delete win.submitQrCode;
      delete win.requestGeolocation;
    };
  }, [content, playerId, episodeId]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}