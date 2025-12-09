'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { EffectData, EffectType, DropdownData } from '@/lib/types/wizard';

interface Props {
  effects: EffectData[];
  dropdownData: DropdownData;
  onChange: (effects: EffectData[]) => void;
}

export function StepEffects({ effects, dropdownData, onChange }: Props) {
  const [effectType, setEffectType] = useState<EffectType>('grant_progress_item');
  const [hasDuration, setHasDuration] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let payload: Record<string, unknown> = {};

    switch (effectType) {
      case 'grant_progress_item':
        payload = { item_id: formData.get('progress_item_id') };
        break;
      case 'grant_inventory_item':
        payload = {
          item_id: formData.get('item_id'),
          quantity: parseInt(formData.get('quantity') as string),
        };
        break;
      case 'modify_experience':
        payload = { amount: parseInt(formData.get('amount') as string) };
        break;
      case 'modify_level':
        payload = { amount: parseInt(formData.get('amount') as string) };
        break;
      case 'grant_achievement':
        payload = { achievement_id: formData.get('achievement_id') };
        break;
      case 'add_status_effect':
        payload = { status_type: formData.get('status_type') };
        if (hasDuration) {
          payload.duration_minutes = parseInt(formData.get('duration_minutes') as string);
        }
        break;
    }

    const newEffect: EffectData = {
      type: effectType,
      payload,
      tempId: crypto.randomUUID(),
    };

    onChange([...effects, newEffect]);
    e.currentTarget.reset();
    setHasDuration(false);
  };

  const handleRemove = (tempId: string) => {
    onChange(effects.filter(e => e.tempId !== tempId));
  };

  const getEffectLabel = (effect: EffectData): string => {
    switch (effect.type) {
      case 'grant_progress_item': {
        const item = dropdownData.progressItems.find(
          i => i.progress_item_id === effect.payload.item_id
        );
        return `🎯 Progress: ${item?.name || 'Unknown'}`;
      }
      case 'grant_inventory_item': {
        const item = dropdownData.inventoryItems.find(
          i => i.item_id === effect.payload.item_id
        );
        return `📦 Item: ${item?.name || 'Unknown'} (x${effect.payload.quantity})`;
      }
      case 'modify_experience':
        return `⭐ XP: ${(effect.payload.amount as number) > 0 ? '+' : ''}${effect.payload.amount}`;
      case 'modify_level':
        return `📊 Livello: ${(effect.payload.amount as number) > 0 ? '+' : ''}${effect.payload.amount}`;
      case 'grant_achievement': {
        const ach = dropdownData.achievements.find(
          a => a.achievement_id === effect.payload.achievement_id
        );
        return `🏆 Achievement: ${ach?.name || 'Unknown'}`;
      }
      case 'add_status_effect': {
        const duration = effect.payload.duration_minutes 
          ? ` (${effect.payload.duration_minutes}min)` 
          : ' (permanente)';
        return `✨ Status: ${effect.payload.status_type}${duration}`;
      }
      default:
        return effect.type;
    }
  };

  const getEffectDescription = (effect: EffectData): string => {
    switch (effect.type) {
      case 'grant_progress_item':
        return 'Progress item invisibile per sbloccare altri nodi';
      case 'grant_inventory_item':
        return 'Item aggiunto all\'inventario dell\'episodio';
      case 'modify_experience':
        return (effect.payload.amount as number) > 0 ? 'Aumenta esperienza giocatore' : 'Riduce esperienza giocatore';
      case 'modify_level':
        return (effect.payload.amount as number) > 0 ? 'Aumenta livello giocatore' : 'Riduce livello giocatore';
      case 'grant_achievement':
        return 'Achievement sbloccato';
      case 'add_status_effect':
        return effect.payload.duration_minutes 
          ? 'Status temporaneo' 
          : 'Status permanente (finisce con l\'episodio)';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-purple-200">
          <p className="font-semibold mb-1">Effects (Opzionali)</p>
          <p className="text-purple-300/80">
            Gli effects sono le ricompense che il giocatore riceve quando completa il nodo. 
            Puoi aggiungere più effects e verranno applicati tutti insieme. 
            Se non aggiungi effects, il completamento non darà ricompense.
          </p>
        </div>
      </div>

      {/* Add Effect Form */}
      <form onSubmit={handleAdd} className="bg-slate-700/30 rounded-lg border border-slate-600 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">Aggiungi Effect</h3>
        
        <div>
          <Label htmlFor="effect-type">Tipo Effect</Label>
          <select 
            id="effect-type"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
            value={effectType}
            onChange={(e) => {
              setEffectType(e.target.value as EffectType);
              setHasDuration(false);
            }}
          >
            <option value="grant_progress_item">Grant Progress Item</option>
            <option value="grant_inventory_item">Grant Inventory Item</option>
            <option value="modify_experience">Modify Experience</option>
            <option value="modify_level">Modify Level</option>
            <option value="grant_achievement">Grant Achievement</option>
            <option value="add_status_effect">Add Status Effect</option>
          </select>
        </div>

        {/* Dynamic Fields based on type */}
        {effectType === 'grant_progress_item' && (
          <div>
            <Label htmlFor="progress_item_id">Progress Item*</Label>
            <select 
              id="progress_item_id"
              name="progress_item_id" 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" 
              required
            >
              <option value="">Seleziona...</option>
              {dropdownData.progressItems.map(item => (
                <option key={item.progress_item_id} value={item.progress_item_id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Progress item invisibile al giocatore, usato per sbloccare altri nodi
            </p>
          </div>
        )}

        {effectType === 'grant_inventory_item' && (
          <>
            <div>
              <Label htmlFor="item_id">Inventory Item*</Label>
              <select 
                id="item_id"
                name="item_id" 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" 
                required
              >
                <option value="">Seleziona...</option>
                {dropdownData.inventoryItems.map(item => (
                  <option key={item.item_id} value={item.item_id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantità*</Label>
              <Input 
                id="quantity"
                name="quantity" 
                type="number" 
                min="1"
                defaultValue={1}
                required 
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </>
        )}

        {effectType === 'modify_experience' && (
          <div>
            <Label htmlFor="amount">Quantità XP*</Label>
            <Input 
              id="amount"
              name="amount" 
              type="number" 
              required 
              placeholder="100"
              className="bg-slate-800 border-slate-600"
            />
            <p className="text-xs text-slate-400 mt-1">
              Usa valori positivi per aggiungere XP, negativi per rimuovere
            </p>
          </div>
        )}

        {effectType === 'modify_level' && (
          <div>
            <Label htmlFor="amount">Modifica Livello*</Label>
            <Input 
              id="amount"
              name="amount" 
              type="number" 
              required 
              placeholder="1"
              className="bg-slate-800 border-slate-600"
            />
            <p className="text-xs text-slate-400 mt-1">
              Di solito +1 per level up, -1 per level down
            </p>
          </div>
        )}

        {effectType === 'grant_achievement' && (
          <div>
            <Label htmlFor="achievement_id">Achievement*</Label>
            <select 
              id="achievement_id"
              name="achievement_id" 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" 
              required
            >
              <option value="">Seleziona...</option>
              {dropdownData.achievements.map(ach => (
                <option key={ach.achievement_id} value={ach.achievement_id}>
                  {ach.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {effectType === 'add_status_effect' && (
          <>
            <div>
              <Label htmlFor="status_type">Status Type*</Label>
              <Input 
                id="status_type"
                name="status_type" 
                required 
                placeholder="speed_boost"
                className="bg-slate-800 border-slate-600"
              />
              <p className="text-xs text-slate-400 mt-1">
                Nome del status effect (es: speed_boost, strength, invisibility)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="has-duration"
                checked={hasDuration}
                onChange={(e) => setHasDuration(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="has-duration" className="cursor-pointer">
                Ha durata limitata
              </Label>
            </div>
            {hasDuration && (
              <div>
                <Label htmlFor="duration_minutes">Durata (minuti)*</Label>
                <Input 
                  id="duration_minutes"
                  name="duration_minutes" 
                  type="number" 
                  min="1"
                  placeholder="30"
                  className="bg-slate-800 border-slate-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Dopo questo tempo, lo status verrà rimosso automaticamente
                </p>
              </div>
            )}
            {!hasDuration && (
              <p className="text-xs text-slate-400">
                ℹ️ Senza durata, lo status resta attivo fino alla fine dell episodio
              </p>
            )}
          </>
        )}

        <Button 
          type="submit" 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Effect
        </Button>
      </form>

      {/* Effects List */}
      {effects.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-400">
            ✨ Effects Aggiunti ({effects.length})
          </h3>
          {effects.map((effect) => (
            <div 
              key={effect.tempId}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">
                  {getEffectLabel(effect)}
                </div>
                <p className="text-xs text-slate-400">{getEffectDescription(effect)}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(effect.tempId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm">Nessun effect aggiunto. Il completamento non darà ricompense.</p>
        </div>
      )}
    </div>
  );
}