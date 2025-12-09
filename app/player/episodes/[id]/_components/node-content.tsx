'use client';

import { useEffect } from 'react';

interface Props {
  content: string;
  nodeId: string;
  episodeId: string;
  playerId: string;
}

export function NodeContent({ content, nodeId, episodeId, playerId }: Props) {
  useEffect(() => {
    const CTX = { playerId, episodeId, nodeId };

    function showNotification(message: string, type: string = 'info') {
      const existing = document.querySelector('.evendral-notification');
      if (existing) existing.remove();

      const colors: Record<string, { bg: string; border: string }> = {
        success: { bg: '#22c55e', border: '#16a34a' },
        error: { bg: '#ef4444', border: '#dc2626' },
        info: { bg: '#3b82f6', border: '#2563eb' },
        warning: { bg: '#f59e0b', border: '#d97706' }
      };
      const c = colors[type] || colors.info;

      const n = document.createElement('div');
      n.className = 'evendral-notification';
      n.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${c.bg};
        border: 2px solid ${c.border};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 90vw;
        text-align: center;
      `;
      n.textContent = message;
      document.body.appendChild(n);

      setTimeout(() => n.remove(), 3000);
    }

    function updateTargetUI(targetId: string) {
      const el = document.querySelector(`[data-target-id="${targetId}"]`) as HTMLElement;
      if (!el) return;
      el.style.opacity = '0.7';
      el.style.pointerEvents = 'none';
      el.querySelectorAll('input, button').forEach((x) => {
        (x as HTMLInputElement | HTMLButtonElement).disabled = true;
      });

      const badge = document.createElement('div');
      badge.style.cssText = `
        background: #22c55e;
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 8px;
        display: inline-block;
      `;
      badge.textContent = '✓ Completato';
      el.appendChild(badge);
    }

    function showCompletionModal() {
      const m = document.createElement('div');
      m.className = 'evendral-completion-modal';
      m.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      `;
      m.innerHTML = `
        <div style="background:linear-gradient(135deg,#1e293b,#0f172a);border:2px solid #f59e0b;border-radius:16px;padding:32px;text-align:center;max-width:90vw;width:400px;">
          <div style="font-size:48px;margin-bottom:16px;">🎉</div>
          <h2 style="color:#fbbf24;font-size:24px;margin:0 0 12px;">Nodo Completato!</h2>
          <p style="color:#94a3b8;margin:0 0 24px;">Hai completato tutti gli obiettivi.</p>
          <button id="evendral-completion-btn" style="background:linear-gradient(90deg,#f59e0b,#ea580c);color:white;border:none;padding:12px 32px;border-radius:8px;font-weight:600;cursor:pointer;">Continua</button>
        </div>
      `;
      document.body.appendChild(m);
      document.getElementById('evendral-completion-btn')?.addEventListener('click', () => {
        m.remove();
        window.location.reload();
      });
    }

    async function handleCodeSubmit(inputId: string, targetId: string) {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (!input) return showNotification('Input non trovato', 'error');

      const code = input.value.trim();
      if (!code) return showNotification('Inserisci un codice!', 'warning');

      input.disabled = true;
      const btn = input.closest('.evendral-target')?.querySelector('button') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Verifica...';
      }

      try {
        const fd = new FormData();
        fd.append('playerId', CTX.playerId);
        fd.append('episodeId', CTX.episodeId);
        fd.append('nodeId', CTX.nodeId);
        fd.append('targetId', targetId);
        fd.append('code', code);

        const response = await fetch('/api/player/validate-code', { method: 'POST', body: fd });
        const res = await response.json();

        if (res.success) {
          showNotification(res.message || 'Codice corretto!', 'success');
          updateTargetUI(targetId);
          if (res.nodeCompleted) setTimeout(showCompletionModal, 500);
        } else {
          showNotification(res.message || 'Codice errato!', 'error');
          input.disabled = false;
          input.value = '';
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Invia';
          }
        }
      } catch {
        showNotification('Errore di connessione', 'error');
        input.disabled = false;
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Invia';
        }
      }
    }

    async function handleGpsSubmit(targetId: string) {
      const el = document.querySelector(`[data-target-id="${targetId}"]`) as HTMLElement;
      const btn = el?.querySelector('button') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Localizzazione...';
      }

      if (!navigator.geolocation) {
        showNotification('GPS non supportato', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Verifica Posizione';
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const fd = new FormData();
            fd.append('playerId', CTX.playerId);
            fd.append('episodeId', CTX.episodeId);
            fd.append('nodeId', CTX.nodeId);
            fd.append('targetId', targetId);
            fd.append('lat', pos.coords.latitude.toString());
            fd.append('lng', pos.coords.longitude.toString());

            const response = await fetch('/api/player/validate-gps', { method: 'POST', body: fd });
            const res = await response.json();

            if (res.success) {
              showNotification(res.message || 'Posizione corretta!', 'success');
              updateTargetUI(targetId);
              if (res.nodeCompleted) setTimeout(showCompletionModal, 500);
            } else {
              showNotification(res.message || 'Posizione errata', 'error');
              if (btn) {
                btn.disabled = false;
                btn.textContent = 'Verifica Posizione';
              }
            }
          } catch {
            showNotification('Errore connessione', 'error');
            if (btn) {
              btn.disabled = false;
              btn.textContent = 'Verifica Posizione';
            }
          }
        },
        (err) => {
          showNotification('Errore GPS: ' + err.message, 'error');
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Verifica Posizione';
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    async function handleOwnedItemCheck(targetId: string) {
      const el = document.querySelector(`[data-target-id="${targetId}"]`) as HTMLElement;

      try {
        const fd = new FormData();
        fd.append('playerId', CTX.playerId);
        fd.append('episodeId', CTX.episodeId);
        fd.append('nodeId', CTX.nodeId);
        fd.append('targetId', targetId);

        const response = await fetch('/api/player/check-owned-item', { method: 'POST', body: fd });
        const res = await response.json();
        console.log('Owned item check', res);

        const txt = el?.querySelector('.item-check') as HTMLElement;
        if (res.success) {
          if (txt) {
            txt.textContent = '✓ Item posseduto!';
            txt.style.color = '#22c55e';
          }
          updateTargetUI(targetId);
          if (res.nodeCompleted) setTimeout(showCompletionModal, 500);
        } else {
          if (txt) {
            txt.textContent = '✗ Item mancante';
            txt.style.color = '#ef4444';
          }
        }
      } catch {
        console.error('Item check error');
      }
    }

    // EVENT DELEGATION
    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;

      const targetEl = btn.closest('.evendral-target') as HTMLElement;
      if (!targetEl) return;

      const targetId = targetEl.getAttribute('data-target-id');
      const targetType = targetEl.getAttribute('data-target-type');
      if (!targetId) return;

      e.preventDefault();

      if (targetType === 'code_entry') {
        const input = targetEl.querySelector('input') as HTMLInputElement;
        if (input) handleCodeSubmit(input.id, targetId);
      } else if (targetType === 'gps_location') {
        handleGpsSubmit(targetId);
      }
    }

    document.addEventListener('click', handleClick);

    // Auto-check owned items
    document.querySelectorAll('.evendral-owned-item').forEach((el) => {
      const targetId = el.getAttribute('data-target-id');
      if (targetId) handleOwnedItemCheck(targetId);
    });

    console.log('🎮 Evendral NodeContent ready', CTX);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [playerId, episodeId, nodeId]);

  return (
    <>
      <style>{`
        .evendral-target {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border: 2px solid #475569;
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
        }
        .evendral-target input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #475569;
          background: #0f172a;
          color: white;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .evendral-target input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }
        .evendral-target button {
          background: linear-gradient(90deg, #f59e0b, #ea580c);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .evendral-target button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .evendral-target label {
          display: block;
          color: #fbbf24;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .evendral-target .location-name,
        .evendral-target .item-check {
          color: #fbbf24;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        .evendral-target .location-hint,
        .evendral-target .item-hint {
          color: #94a3b8;
          font-size: 14px;
          margin: 0 0 12px 0;
        }
      `}</style>
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}