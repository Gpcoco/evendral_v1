'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import type { TargetData, TargetType, DropdownData } from '@/lib/types/wizard';

interface Props {
  targets: TargetData[];
  dropdownData: DropdownData;
  onChange: (targets: TargetData[]) => void;
}

export function StepTargets({ targets, dropdownData, onChange }: Props) {
  const [targetType, setTargetType] = useState<TargetType>('code_entry');

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let payload: Record<string, unknown> = {};

    switch (targetType) {
      case 'gps_location':
        payload = {
          lat: parseFloat(formData.get('lat') as string),
          lng: parseFloat(formData.get('lng') as string),
          radius: parseInt(formData.get('radius') as string),
          name: formData.get('name') as string,
        };
        break;
      case 'code_entry':
        payload = { 
          code: formData.get('code') as string 
        };
        break;
      case 'owned_item':
        payload = { 
          item_id: formData.get('item_id') as string 
        };
        break;
    }

    const newTarget: TargetData = {
      type: targetType,
      payload,
      tempId: crypto.randomUUID(),
    };

    onChange([...targets, newTarget]);
    e.currentTarget.reset();
  };

  const handleRemove = (tempId: string) => {
    onChange(targets.filter(t => t.tempId !== tempId));
  };

  const getTargetLabel = (target: TargetData): string => {
    switch (target.type) {
      case 'gps_location':
        return `📍 GPS: ${target.payload.name || 'Location'} (${target.payload.radius}m)`;
      case 'code_entry':
        return `🔑 Code: ${target.payload.code}`;
      case 'owned_item': {
        const item = dropdownData.inventoryItems.find(
          i => i.item_id === target.payload.item_id
        );
        return `📦 Possiede: ${item?.name || 'Unknown Item'}`;
      }
      default:
        return target.type;
    }
  };

  const getTargetDescription = (target: TargetData): string => {
    switch (target.type) {
      case 'gps_location':
        return `Lat: ${target.payload.lat}, Lng: ${target.payload.lng}`;
      case 'code_entry':
        return 'Il giocatore deve inserire questo codice';
      case 'owned_item':
        return 'Il giocatore deve possedere questo item nell\'inventario episodio';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner - Targets Obbligatori */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          <p className="font-semibold mb-1">⚠️ Targets (OBBLIGATORIO)</p>
          <p className="text-amber-300/80">
            Devi aggiungere <strong>almeno 1 target</strong>. I targets sono gli obiettivi che il giocatore 
            deve completare per finire il nodo. Se aggiungi più targets, devono essere TUTTI completati (AND logic).
          </p>
        </div>
      </div>

      {/* Add Target Form */}
      <form onSubmit={handleAdd} className="bg-slate-700/30 rounded-lg border border-slate-600 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">Aggiungi Target</h3>
        
        <div>
          <Label htmlFor="target-type">Tipo Target</Label>
          <select 
            id="target-type"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as TargetType)}
          >
            <option value="code_entry">Code Entry (Inserimento Codice)</option>
            <option value="gps_location">GPS Location (Posizione GPS)</option>
            <option value="owned_item">Owned Item (Possiede Item)</option>
          </select>
        </div>

        {/* Dynamic Fields based on type */}
        {targetType === 'gps_location' && (
          <>
            <div>
              <Label htmlFor="name">Nome Location*</Label>
              <Input 
                id="name"
                name="name" 
                required 
                placeholder="Piazza Centrale"
                className="bg-slate-800 border-slate-600"
              />
              <p className="text-xs text-slate-400 mt-1">Nome descrittivo della location</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude*</Label>
                <Input 
                  id="lat"
                  name="lat" 
                  type="number" 
                  step="any" 
                  required 
                  placeholder="45.6495"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude*</Label>
                <Input 
                  id="lng"
                  name="lng" 
                  type="number" 
                  step="any" 
                  required 
                  placeholder="13.7768"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">Raggio Accettazione (metri)*</Label>
              <Input 
                id="radius"
                name="radius" 
                type="number" 
                required 
                placeholder="50"
                className="bg-slate-800 border-slate-600"
              />
              <p className="text-xs text-slate-400 mt-1">
                Il giocatore deve trovarsi entro questo raggio dalla posizione
              </p>
            </div>
          </>
        )}

        {targetType === 'code_entry' && (
          <div>
            <Label htmlFor="code">Codice Segreto*</Label>
            <Input 
              id="code"
              name="code" 
              required 
              placeholder="DRAGON123"
              className="bg-slate-800 border-slate-600 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">
              Il giocatore dovrà inserire esattamente questo codice (case-sensitive)
            </p>
          </div>
        )}

        {targetType === 'owned_item' && (
          <div>
            <Label htmlFor="item_id">Item Richiesto*</Label>
            <select 
              id="item_id"
              name="item_id" 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" 
              required
            >
              <option value="">Seleziona un item...</option>
              {dropdownData.inventoryItems.map(item => (
                <option key={item.item_id} value={item.item_id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Il sistema controllerà automaticamente se il giocatore possiede questo item 
              nell inventario dell episodio corrente
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Target
        </Button>
      </form>

      {/* Targets List */}
      {targets.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-400">
            ✅ Targets Aggiunti ({targets.length})
          </h3>
          {targets.map((target) => (
            <div 
              key={target.tempId}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">
                  {getTargetLabel(target)}
                </div>
                <p className="text-xs text-slate-400">{getTargetDescription(target)}</p>
                {target.type === 'code_entry' && (
                  <div className="mt-2 text-xs text-blue-400">
                    💡 Puoi collegare questo target all HTML editor nello step 4
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(target.tempId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-red-500/30 rounded-lg bg-red-500/5">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold">Nessun target aggiunto</p>
          <p className="text-sm text-slate-400 mt-1">
            Devi aggiungere almeno 1 target per procedere
          </p>
        </div>
      )}
    </div>
  );
}