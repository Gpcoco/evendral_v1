// /app/admin/item-effects/_components/create-item-effect-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createItemEffect } from '@/lib/actions/item-effects';
import { useRouter } from 'next/navigation';

const EFFECT_PREFIXES = [
  { value: 'scanner', label: '🔍 Scanner', description: 'Modifica comportamento scanner' },
  { value: 'identity', label: '🎭 Identity', description: 'Ruoli e fazioni' },
  { value: 'network', label: '🌐 Network', description: 'Interazioni multiplayer' },
  { value: 'multiplier', label: '📈 Multiplier', description: 'Boost XP/Drop/Currency' },
  { value: 'protection', label: '🛡️ Protection', description: 'Shield e protezioni' },
];

const EFFECT_TYPES_BY_PREFIX: Record<string, string[]> = {
  scanner: ['blocked', 'cooldown_modifier', 'zone_forbidden', 'loot_boost'],
  identity: ['role_vampire', 'role_hunter', 'role_citizen', 'faction_rebels', 'faction_empire'],
  network: ['invisible_map', 'visible_to_faction', 'contagion_active', 'group_xp_share'],
  multiplier: ['xp_boost', 'drop_rate', 'currency_bonus', 'speed'],
  protection: ['shield', 'antivirus', 'damage_reduction', 'revive'],
};

const TRIGGER_OPTIONS = [
  { value: 'receive', label: 'Quando riceve', description: 'Effetto si applica quando player riceve l\'item' },
  { value: 'use', label: 'Quando usa', description: 'Effetto si applica quando player usa l\'item consumabile' },
  { value: 'equip', label: 'Quando equipaggia', description: 'Effetto si applica quando player equipaggia l\'item' },
  { value: 'consume', label: 'Quando consuma', description: 'Effetto si applica al consumo dell\'item' },
];

interface Item {
  item_id: string;
  name: string;
}

export function CreateItemEffectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedPrefix, setSelectedPrefix] = useState<string>('');
  const [selectedSpecific, setSelectedSpecific] = useState<string>('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('receive');
  const [duration, setDuration] = useState<string>('');

  // Fetch items quando dialog si apre
  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  async function fetchItems() {
    const supabase = createClient();
    const { data } = await supabase
      .from('items')
      .select('item_id, name')
      .order('name');
    
    if (data) setItems(data);
  }

  async function handleCreate() {
    if (!selectedItemId || !selectedPrefix || !selectedSpecific) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);

    const effectType = `${selectedPrefix}:${selectedSpecific}`;
    
    // Metadata di default (puoi personalizzare in base al tipo)
    let metadata = {};
    
    if (selectedPrefix === 'identity' && selectedSpecific.startsWith('role_')) {
      metadata = {
        role_name: selectedSpecific.replace('role_', '').charAt(0).toUpperCase() + selectedSpecific.replace('role_', '').slice(1),
        permissions: [],
        restrictions: [],
      };
    } else if (selectedPrefix === 'multiplier') {
      metadata = {
        multiplier: 2.0, // Default 2x
      };
    } else if (selectedPrefix === 'protection' && selectedSpecific === 'shield') {
      metadata = {
        absorb_amount: 100,
      };
    }

    const result = await createItemEffect({
      item_id: selectedItemId,
      effect_type: effectType,
      metadata,
      duration_minutes: duration ? parseInt(duration) : null,
      trigger_on: selectedTrigger as 'receive' | 'use' | 'equip' | 'consume',
    });

    setLoading(false);

    if (result.success) {
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      alert('Errore: ' + result.message);
    }
  }

  function resetForm() {
    setSelectedItemId('');
    setSelectedPrefix('');
    setSelectedSpecific('');
    setSelectedTrigger('receive');
    setDuration('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Effetto Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configura Effetto per Item</DialogTitle>
          <DialogDescription>
            Configura quale effetto viene applicato quando un player interagisce con un item
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Step 1: Seleziona item */}
          <div className="grid gap-2">
            <Label>Item che trigge effetto *</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona item..." />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.item_id} value={item.item_id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Step 2: Seleziona prefisso */}
          <div className="grid gap-2">
            <Label>Categoria Effetto *</Label>
            <Select value={selectedPrefix} onValueChange={(val: string) => {
              setSelectedPrefix(val);
              setSelectedSpecific(''); // Reset specific quando cambi categoria
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria..." />
              </SelectTrigger>
              <SelectContent>
                {EFFECT_PREFIXES.map(prefix => (
                  <SelectItem key={prefix.value} value={prefix.value}>
                    <div>
                      <div>{prefix.label}</div>
                      <div className="text-xs text-muted-foreground">{prefix.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Step 3: Seleziona tipo specifico */}
          {selectedPrefix && (
            <div className="grid gap-2">
              <Label>Tipo Specifico *</Label>
              <Select value={selectedSpecific} onValueChange={setSelectedSpecific}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {EFFECT_TYPES_BY_PREFIX[selectedPrefix]?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Step 4: Trigger */}
          <div className="grid gap-2">
            <Label>Quando applicare *</Label>
            <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Step 5: Durata */}
          <div className="grid gap-2">
            <Label>Durata (minuti)</Label>
            <Input
              type="number"
              placeholder="Lascia vuoto per permanente"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se vuoto, l effetto dura fino alla fine dell episodio
            </p>
          </div>
          
          {/* Preview */}
          {selectedPrefix && selectedSpecific && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Preview configurazione:</p>
              <div className="space-y-1 text-sm">
                <div>Effetto: <code className="bg-background px-2 py-1 rounded">{selectedPrefix}:{selectedSpecific}</code></div>
                <div>Trigger: <code className="bg-background px-2 py-1 rounded">{selectedTrigger}</code></div>
                <div>Durata: <code className="bg-background px-2 py-1 rounded">{duration || 'permanente'}</code></div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleCreate} disabled={loading || !selectedItemId || !selectedPrefix || !selectedSpecific}>
            {loading ? 'Creazione...' : 'Crea Effetto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}