// /app/admin/episodes/[id]/_components/step-html-editor.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Eye, 
  Plus, 
  MapPin, 
  Package, 
  KeyRound,
  Info,
  CheckCircle2,
  EyeOff
} from 'lucide-react';
import type { WizardState, NodeCategory } from '@/lib/types/wizard';

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  inventoryItems: Array<{item_id: string, name: string}>;
  progressItems: Array<{progress_item_id: string, name: string}>;
}

export function StepHtmlEditor({ state, onChange, inventoryItems, progressItems }: Props) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inserisce placeholder alla posizione del cursore
  const insertPlaceholder = (index: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const placeholder = `{{TARGET_${index}}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = state.contentHtml;

    const newValue = 
      currentValue.substring(0, start) + 
      placeholder + 
      currentValue.substring(end);

    onChange({ contentHtml: newValue });

    // Riposiziona cursore dopo il placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  // Verifica se un placeholder è già presente nell'HTML
  const isPlaceholderUsed = (index: number): boolean => {
    return state.contentHtml.includes(`{{TARGET_${index}}}`);
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'code_entry': return <KeyRound className="w-4 h-4" />;
      case 'gps_location': return <MapPin className="w-4 h-4" />;
      case 'owned_item': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTargetLabel = (target: typeof state.targets[0]) => {
    switch (target.type) {
      case 'code_entry':
        return `Codice: ${target.payload.code}`;
      case 'gps_location':
        return `GPS: ${target.payload.name}`;
      case 'owned_item': {
        const item = inventoryItems.find(i => i.item_id === target.payload.item_id);
        return `Item: ${item?.name || 'Unknown'}`;
      }
      default:
        return target.type;
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'code_entry': return 'Input codice';
      case 'gps_location': return 'Verifica GPS';
      case 'owned_item': return 'Check inventario';
      default: return type;
    }
  };

  // Genera preview HTML con placeholder stilizzati
  const generatePreviewHtml = (): string => {
    let previewHtml = state.contentHtml;

    state.targets.forEach((target, index) => {
      const placeholder = `{{TARGET_${index}}}`;
      const previewBlock = generatePreviewBlock(target, index);
      previewHtml = previewHtml.replace(new RegExp(placeholder, 'g'), previewBlock);
    });

    // Placeholder non validi
    previewHtml = previewHtml.replace(
      /\{\{TARGET_\d+\}\}/g, 
      '<div style="background:#dc2626;color:white;padding:8px;border-radius:4px;margin:8px 0;">⚠️ Placeholder non valido</div>'
    );

    return previewHtml;
  };

  const generatePreviewBlock = (target: typeof state.targets[0], index: number): string => {
    const baseStyle = `
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      font-family: system-ui, sans-serif;
    `;

    switch (target.type) {
      case 'code_entry':
        return `
          <div style="${baseStyle}">
            <label style="color:#fbbf24;font-weight:600;display:block;margin-bottom:8px;">
              🔑 Inserisci il codice:
            </label>
            <input 
              type="text" 
              placeholder="Inserisci codice..." 
              style="width:100%;padding:10px;border-radius:6px;border:1px solid #475569;background:#0f172a;color:white;margin-bottom:8px;"
              disabled
            />
            <button style="background:linear-gradient(90deg,#f59e0b,#ea580c);color:white;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
              Invia
            </button>
            <div style="color:#94a3b8;font-size:12px;margin-top:8px;">
              [Preview] Target #${index} - code_entry
            </div>
          </div>
        `;

      case 'gps_location':
        return `
          <div style="${baseStyle}">
            <p style="color:#fbbf24;font-weight:600;margin:0 0 8px 0;">
              📍 ${target.payload.name || 'Location'}
            </p>
            <p style="color:#94a3b8;font-size:14px;margin:0 0 12px 0;">
              Raggiungi questa posizione (raggio: ${target.payload.radius}m)
            </p>
            <button style="background:linear-gradient(90deg,#22c55e,#16a34a);color:white;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
              Verifica Posizione
            </button>
            <div style="color:#94a3b8;font-size:12px;margin-top:8px;">
              [Preview] Target #${index} - gps_location
            </div>
          </div>
        `;

      case 'owned_item': {
        const item = inventoryItems.find(i => i.item_id === target.payload.item_id);
        return `
          <div style="${baseStyle}">
            <p style="color:#fbbf24;font-weight:600;margin:0 0 8px 0;">
              📦 Item richiesto: ${item?.name || 'Unknown'}
            </p>
            <p style="color:#94a3b8;font-size:14px;margin:0;">
              Il sistema verificherà automaticamente il tuo inventario
            </p>
            <div style="color:#94a3b8;font-size:12px;margin-top:8px;">
              [Preview] Target #${index} - owned_item (verifica automatica)
            </div>
          </div>
        `;
      }

      default:
        return `<div style="${baseStyle}">Target sconosciuto</div>`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="node-name">Nome Nodo*</Label>
          <Input
            id="node-name"
            value={state.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Capitolo 1: L'inizio"
            className="bg-slate-800 border-slate-600"
            required
          />
        </div>
        <div>
          <Label htmlFor="node-category">Categoria</Label>
          <select
            id="node-category"
            value={state.category}
            onChange={(e) => onChange({ category: e.target.value as NodeCategory })}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option value="main_story">Main Story</option>
            <option value="side_quest">Side Quest</option>
            <option value="tutorial">Tutorial</option>
            <option value="ending">Ending</option>
          </select>
        </div>
        <div>
          <Label htmlFor="hide-progress-item" className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-400" />
            Nascondi quando completato
          </Label>
          <select
            id="hide-progress-item"
            value={state.hideProgressItemId || ''}
            onChange={(e) => onChange({ hideProgressItemId: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option value="">Nessuno (sempre visibile)</option>
            {progressItems.map((item) => (
              <option key={item.progress_item_id} value={item.progress_item_id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          <p className="font-semibold mb-1">Come funziona</p>
          <p className="text-blue-300/80 mb-2">
            Scrivi il tuo HTML custom e clicca <strong>Inserisci</strong> nella sidebar per aggiungere 
            i target dove vuoi. I placeholder <code className="bg-blue-900/50 px-1 rounded">{'{{TARGET_X}}'}</code> verranno 
            sostituiti automaticamente con gli elementi interattivi al salvataggio.
          </p>
          <p className="text-blue-300/80">
            <strong>Hide Progress Item:</strong> Se selezioni un progress item, questo nodo verrà nascosto 
            dalla lista quando il giocatore ottiene quel progress item (utile per tenere pulita la schermata).
          </p>
        </div>
      </div>

      {/* Split View: Editor + Targets Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: HTML Editor (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="editor" className="data-[state=active]:bg-slate-600">
                <Code className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-slate-600">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-4">
              <div>
                <Label htmlFor="content-html">Contenuto HTML*</Label>
                <textarea
                  ref={textareaRef}
                  id="content-html"
                  value={state.contentHtml}
                  onChange={(e) => onChange({ contentHtml: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white font-mono text-sm min-h-[450px] resize-y focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  placeholder={`<div class="my-custom-card">
  <h2>🎮 Benvenuto nell'avventura!</h2>
  <p>La tua missione inizia qui...</p>
  
  <!-- Inserisci i target dalla sidebar -->
  {{TARGET_0}}
  
</div>`}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="bg-slate-900 rounded-lg p-6 min-h-[450px] border border-slate-600 overflow-auto">
                {state.contentHtml ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }}
                  />
                ) : (
                  <div className="text-slate-400 text-center py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Preview vuota</p>
                    <p className="text-sm mt-1">Scrivi del HTML nell editor</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Targets Sidebar (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              🎯 Targets ({state.targets.length})
            </h3>

            {state.targets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nessun target definito</p>
                <p className="text-xs mt-2">Torna allo Step 2 per aggiungere targets</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.targets.map((target, index) => {
                  const isUsed = isPlaceholderUsed(index);
                  
                  return (
                    <div
                      key={target.tempId}
                      className={`
                        border rounded-lg p-3 transition-all
                        ${isUsed 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-slate-800/50 border-slate-600 hover:border-amber-500/50'
                        }
                      `}
                    >
                      {/* Header con indice e stato */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/20 text-amber-400 text-xs font-mono px-2 py-0.5 rounded">
                            #{index}
                          </span>
                          <span className="text-amber-400">
                            {getTargetIcon(target.type)}
                          </span>
                        </div>
                        {isUsed && (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        )}
                      </div>

                      {/* Info target */}
                      <div className="mb-3">
                        <div className="font-medium text-white text-sm">
                          {getTargetLabel(target)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {getTargetTypeLabel(target.type)}
                        </div>
                      </div>

                      {/* Bottone inserisci */}
                      <Button
                        size="sm"
                        variant={isUsed ? "outline" : "default"}
                        className={`
                          w-full text-xs
                          ${isUsed 
                            ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' 
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }
                        `}
                        onClick={() => insertPlaceholder(index)}
                        disabled={activeTab === 'preview'}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {isUsed ? 'Inserisci di nuovo' : 'Inserisci'}
                      </Button>

                      {/* Placeholder code */}
                      <div className="mt-2 text-xs font-mono text-slate-500 text-center">
                        {`{{TARGET_${index}}}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Targets non inseriti warning */}
            {state.targets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                {state.targets.every((_, i) => isPlaceholderUsed(i)) ? (
                  <div className="text-xs text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Tutti i target sono stati inseriti
                  </div>
                ) : (
                  <div className="text-xs text-amber-400">
                    ⚠️ Alcuni target non sono ancora nell HTML
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}