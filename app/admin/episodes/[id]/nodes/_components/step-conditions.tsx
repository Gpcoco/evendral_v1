'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Info } from 'lucide-react';
import type { ConditionData, ConditionType, DropdownData } from '@/lib/types/wizard';

interface Props {
  conditions: ConditionData[];
  dropdownData: DropdownData;
  onChange: (conditions: ConditionData[]) => void;
}

export function StepConditions({ conditions, dropdownData, onChange }: Props) {
  const [conditionType, setConditionType] = useState<ConditionType>('completed_progress');
  const [checkQuantity, setCheckQuantity] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let payload: Record<string, unknown> = {};

    switch (conditionType) {
      case 'completed_progress':
        payload = { item_id: formData.get('progress_item_id') };
        break;
      case 'player_experience':
        payload = { min_experience: parseInt(formData.get('min_experience') as string) };
        break;
      case 'player_level':
        payload = { min_level: parseInt(formData.get('min_level') as string) };
        break;
      case 'has_inventory_item':
        payload = { item_id: formData.get('item_id') };
        if (checkQuantity) {
          payload.min_quantity = parseInt(formData.get('min_quantity') as string);
        }
        break;
      case 'has_achievement':
        payload = { achievement_id: formData.get('achievement_id') };
        break;
      case 'has_status_effect':
        payload = { status_type: formData.get('status_type') };
        break;
      case 'gps_location':
        payload = {
          lat: parseFloat(formData.get('lat') as string),
          lng: parseFloat(formData.get('lng') as string),
          radius: parseInt(formData.get('radius') as string),
        };
        break;
    }

    const newCondition: ConditionData = {
      type: conditionType,
      payload,
      tempId: crypto.randomUUID(),
    };

    onChange([...conditions, newCondition]);
    e.currentTarget.reset();
    setCheckQuantity(false);
  };

  const handleRemove = (tempId: string) => {
    onChange(conditions.filter(c => c.tempId !== tempId));
  };

  const getConditionLabel = (condition: ConditionData): string => {
    switch (condition.type) {
      case 'completed_progress': {
        const item = dropdownData.progressItems.find(
          i => i.progress_item_id === condition.payload.item_id
        );
        return `Progress: ${item?.name || 'Unknown'}`;
      }
      case 'player_experience':
        return `Min XP: ${condition.payload.min_experience}`;
      case 'player_level':
        return `Min Level: ${condition.payload.min_level}`;
      case 'has_inventory_item': {
        const item = dropdownData.inventoryItems.find(
          i => i.item_id === condition.payload.item_id
        );
        const qty = condition.payload.min_quantity 
          ? ` (${condition.payload.min_quantity}x)` 
          : '';
        return `Item: ${item?.name || 'Unknown'}${qty}`;
      }
      case 'has_achievement': {
        const ach = dropdownData.achievements.find(
          a => a.achievement_id === condition.payload.achievement_id
        );
        return `Achievement: ${ach?.name || 'Unknown'}`;
      }
      case 'has_status_effect':
        return `Status: ${condition.payload.status_type}`;
      case 'gps_location':
        return `GPS: ${condition.payload.lat}, ${condition.payload.lng} (${condition.payload.radius}m)`;
      default:
        return condition.type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          <p className="font-semibold mb-1">Conditions (Opzionali)</p>
          <p className="text-blue-300/80">
            Le conditions determinano quando il nodo diventa visibile al giocatore. 
            Se aggiungi più conditions, devono essere TUTTE soddisfatte (AND logic). 
            Se non aggiungi nessuna condition, il nodo sarà sempre visibile.
          </p>
        </div>
      </div>

      {/* Add Condition Form */}
      <form onSubmit={handleAdd} className="bg-slate-700/30 rounded-lg border border-slate-600 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">Aggiungi Condition</h3>
        
        <div>
          <Label htmlFor="condition-type">Tipo Condition</Label>
          <select 
            id="condition-type"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
            value={conditionType}
            onChange={(e) => {
              setConditionType(e.target.value as ConditionType);
              setCheckQuantity(false);
            }}
          >
            <option value="completed_progress">Completed Progress Item</option>
            <option value="player_experience">Player Experience (Min)</option>
            <option value="player_level">Player Level (Min)</option>
            <option value="has_inventory_item">Has Inventory Item</option>
            <option value="has_achievement">Has Achievement</option>
            <option value="has_status_effect">Has Status Effect</option>
            <option value="gps_location">GPS Location</option>
          </select>
        </div>

        {/* Dynamic Fields based on type */}
        {conditionType === 'completed_progress' && (
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
          </div>
        )}

        {conditionType === 'player_experience' && (
          <div>
            <Label htmlFor="min_experience">Esperienza Minima*</Label>
            <Input 
              id="min_experience"
              name="min_experience" 
              type="number" 
              required 
              placeholder="100"
              className="bg-slate-800 border-slate-600"
            />
          </div>
        )}

        {conditionType === 'player_level' && (
          <div>
            <Label htmlFor="min_level">Livello Minimo*</Label>
            <Input 
              id="min_level"
              name="min_level" 
              type="number" 
              required 
              placeholder="5"
              className="bg-slate-800 border-slate-600"
            />
          </div>
        )}

        {conditionType === 'has_inventory_item' && (
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
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="check-quantity"
                checked={checkQuantity}
                onChange={(e) => setCheckQuantity(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="check-quantity" className="cursor-pointer">
                Richiedi quantità minima
              </Label>
            </div>
            {checkQuantity && (
              <div>
                <Label htmlFor="min_quantity">Quantità Minima*</Label>
                <Input 
                  id="min_quantity"
                  name="min_quantity" 
                  type="number" 
                  required 
                  placeholder="1"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            )}
          </>
        )}

        {conditionType === 'has_achievement' && (
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

        {conditionType === 'has_status_effect' && (
          <div>
            <Label htmlFor="status_type">Status Type*</Label>
            <Input 
              id="status_type"
              name="status_type" 
              required 
              placeholder="speed_boost"
              className="bg-slate-800 border-slate-600"
            />
          </div>
        )}

        {conditionType === 'gps_location' && (
          <>
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
              <Label htmlFor="radius">Radius (metri)*</Label>
              <Input 
                id="radius"
                name="radius" 
                type="number" 
                required 
                placeholder="50"
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </>
        )}

        <Button 
          type="submit" 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Condition
        </Button>
      </form>

      {/* Conditions List */}
      {conditions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-400">
            Conditions Aggiunte ({conditions.length})
          </h3>
          {conditions.map((condition) => (
            <div 
              key={condition.tempId}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <div className="font-semibold text-white">{getConditionLabel(condition)}</div>
                <code className="text-xs text-slate-400 mt-1 block">
                  Type: {condition.type}
                </code>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(condition.tempId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {conditions.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">Nessuna condition aggiunta. Il nodo sarà sempre visibile.</p>
        </div>
      )}
    </div>
  );
}