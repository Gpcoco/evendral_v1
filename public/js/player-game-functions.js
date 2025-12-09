/**
 * Evendral - Player Game Functions
 * Funzioni globali per interazione gameplay nei nodi
 * 
 * Variabili globali disponibili (iniettate dal server):
 * - window.__PLAYER_ID__
 * - window.__EPISODE_ID__
 * - window.__NODE_ID__
 */

(function() {
  'use strict';

  // =====================================================
  // UTILITIES
  // =====================================================

  function getContext() {
    return {
      playerId: window.__PLAYER_ID__,
      episodeId: window.__EPISODE_ID__,
      nodeId: window.__NODE_ID__
    };
  }

  function showNotification(message, type = 'info') {
    // Rimuovi notifiche esistenti
    const existing = document.querySelector('.evendral-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'evendral-notification';
    
    const colors = {
      success: { bg: '#22c55e', border: '#16a34a' },
      error: { bg: '#ef4444', border: '#dc2626' },
      info: { bg: '#3b82f6', border: '#2563eb' },
      warning: { bg: '#f59e0b', border: '#d97706' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color.bg};
      border: 2px solid ${color.border};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      animation: slideDown 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 90vw;
      text-align: center;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-rimuovi dopo 3 secondi
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function updateTargetUI(targetId, completed) {
    const targetEl = document.querySelector(`[data-target-id="${targetId}"]`);
    if (!targetEl) return;

    if (completed) {
      targetEl.style.opacity = '0.7';
      targetEl.style.pointerEvents = 'none';
      
      // Disabilita input e bottoni
      targetEl.querySelectorAll('input, button').forEach(el => {
        el.disabled = true;
      });

      // Aggiungi badge completato
      const badge = document.createElement('div');
      badge.className = 'evendral-completed-badge';
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
      targetEl.appendChild(badge);
    }
  }

  function showCompletionModal() {
    const modal = document.createElement('div');
    modal.className = 'evendral-completion-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid #f59e0b;
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        max-width: 90vw;
        width: 400px;
        animation: scaleIn 0.3s ease;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h2 style="color: #fbbf24; font-size: 24px; margin: 0 0 12px 0;">
          Nodo Completato!
        </h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0;">
          Hai completato tutti gli obiettivi di questo nodo.
        </p>
        <button 
          onclick="this.closest('.evendral-completion-modal').remove(); window.location.reload();"
          style="
            background: linear-gradient(90deg, #f59e0b, #ea580c);
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
          "
        >
          Continua
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // =====================================================
  // TARGET VALIDATION FUNCTIONS
  // =====================================================

  /**
   * Invia codice per validazione
   * @param {string} inputId - ID dell'input field
   * @param {string} targetId - UUID del target nel database
   */
  window.submitTargetCode = async function(inputId, targetId) {
    const ctx = getContext();
    const input = document.getElementById(inputId);
    
    if (!input) {
      showNotification('Errore: input non trovato', 'error');
      console.error('Input not found:', inputId);
      return;
    }

    const code = input.value.trim();
    
    if (!code) {
      showNotification('Inserisci un codice!', 'warning');
      input.focus();
      return;
    }

    // Disabilita temporaneamente
    input.disabled = true;
    const button = input.parentElement?.querySelector('button');
    if (button) {
      button.disabled = true;
      button.textContent = 'Verifica...';
    }

    try {
      const formData = new FormData();
      formData.append('player_id', ctx.playerId);
      formData.append('episode_id', ctx.episodeId);
      formData.append('node_id', ctx.nodeId);
      formData.append('target_id', targetId);
      formData.append('code', code);

      const response = await fetch('/api/player/validate-code', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showNotification(result.message || 'Codice corretto!', 'success');
        updateTargetUI(targetId, true);
        
        if (result.nodeCompleted) {
          setTimeout(() => showCompletionModal(), 500);
        }
      } else {
        showNotification(result.message || 'Codice errato!', 'error');
        input.disabled = false;
        input.value = '';
        input.focus();
        if (button) {
          button.disabled = false;
          button.textContent = 'Invia';
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      showNotification('Errore di connessione', 'error');
      input.disabled = false;
      if (button) {
        button.disabled = false;
        button.textContent = 'Invia';
      }
    }
  };

  /**
   * Verifica posizione GPS
   * @param {string} targetId - UUID del target nel database
   */
  window.submitGpsLocation = async function(targetId) {
    const ctx = getContext();
    const targetEl = document.querySelector(`[data-target-id="${targetId}"]`);
    const button = targetEl?.querySelector('button');

    if (button) {
      button.disabled = true;
      button.textContent = 'Localizzazione...';
    }

    // Richiedi geolocalizzazione
    if (!navigator.geolocation) {
      showNotification('Geolocalizzazione non supportata', 'error');
      if (button) {
        button.disabled = false;
        button.textContent = 'Verifica Posizione';
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const formData = new FormData();
          formData.append('player_id', ctx.playerId);
          formData.append('episode_id', ctx.episodeId);
          formData.append('node_id', ctx.nodeId);
          formData.append('target_id', targetId);
          formData.append('lat', latitude.toString());
          formData.append('lng', longitude.toString());

          const response = await fetch('/api/player/validate-gps', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            showNotification(result.message || 'Posizione verificata!', 'success');
            updateTargetUI(targetId, true);
            
            if (result.nodeCompleted) {
              setTimeout(() => showCompletionModal(), 500);
            }
          } else {
            showNotification(result.message || 'Non sei nella posizione corretta', 'error');
            if (button) {
              button.disabled = false;
              button.textContent = 'Verifica Posizione';
            }
          }
        } catch (error) {
          console.error('GPS validation error:', error);
          showNotification('Errore di connessione', 'error');
          if (button) {
            button.disabled = false;
            button.textContent = 'Verifica Posizione';
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = 'Errore geolocalizzazione';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permesso geolocalizzazione negato';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Posizione non disponibile';
            break;
          case error.TIMEOUT:
            message = 'Timeout geolocalizzazione';
            break;
        }
        
        showNotification(message, 'error');
        if (button) {
          button.disabled = false;
          button.textContent = 'Verifica Posizione';
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Verifica possesso item (chiamata automatica)
   * @param {string} targetId - UUID del target nel database
   */
  window.checkOwnedItem = async function(targetId) {
    const ctx = getContext();
    const targetEl = document.querySelector(`[data-target-id="${targetId}"]`);

    try {
      const formData = new FormData();
      formData.append('player_id', ctx.playerId);
      formData.append('episode_id', ctx.episodeId);
      formData.append('node_id', ctx.nodeId);
      formData.append('target_id', targetId);

      const response = await fetch('/api/player/check-owned-item', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Item posseduto
        if (targetEl) {
          const checkText = targetEl.querySelector('.item-check');
          if (checkText) {
            checkText.textContent = '✓ Item posseduto!';
            checkText.style.color = '#22c55e';
          }
        }
        updateTargetUI(targetId, true);
        
        if (result.nodeCompleted) {
          setTimeout(() => showCompletionModal(), 500);
        }
      } else {
        // Item non posseduto
        if (targetEl) {
          const checkText = targetEl.querySelector('.item-check');
          if (checkText) {
            checkText.textContent = '✗ Item mancante';
            checkText.style.color = '#ef4444';
          }
          const hintText = targetEl.querySelector('.item-hint');
          if (hintText) {
            hintText.textContent = result.message || 'Devi trovare questo item prima di continuare';
          }
        }
      }
    } catch (error) {
      console.error('Item check error:', error);
      if (targetEl) {
        const checkText = targetEl.querySelector('.item-check');
        if (checkText) {
          checkText.textContent = 'Errore verifica';
          checkText.style.color = '#ef4444';
        }
      }
    }
  };

  /**
   * Richiedi permesso geolocalizzazione (utility)
   */
  window.requestGeolocation = function() {
    if (!navigator.geolocation) {
      showNotification('Geolocalizzazione non supportata', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        showNotification(
          `Posizione: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          'success'
        );
      },
      (error) => {
        showNotification('Errore: ' + error.message, 'error');
      }
    );
  };

  // =====================================================
  // CSS ANIMATIONS (inject once)
  // =====================================================

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    /* Default styles for target elements */
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
      transition: transform 0.1s, opacity 0.2s;
    }
    
    .evendral-target button:hover:not(:disabled) {
      transform: scale(1.02);
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
  `;
  document.head.appendChild(style);

  console.log('🎮 Evendral Player Functions loaded');
})();