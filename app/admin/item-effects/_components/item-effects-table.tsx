// /app/admin/item-effects/_components/item-effects-table.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { ItemEffect } from '@/lib/effects/types';
import { deleteItemEffect, updateItemEffect } from '@/lib/actions/item-effects';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ItemEffectWithName extends ItemEffect {
  item_name: string;
}

export function ItemEffectsTable({ itemEffects }: { itemEffects: ItemEffectWithName[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDelete(itemEffectId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo effetto?')) return;
    
    setLoading(itemEffectId);
    const result = await deleteItemEffect(itemEffectId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert('Errore: ' + result.message);
    }
    setLoading(null);
  }

  async function handleToggleActive(itemEffectId: string, currentState: boolean) {
    setLoading(itemEffectId);
    const result = await updateItemEffect(itemEffectId, {
      is_active: !currentState,
    });
    
    if (result.success) {
      router.refresh();
    } else {
      alert('Errore: ' + result.message);
    }
    setLoading(null);
  }

  if (itemEffects.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          Nessun effetto configurato. Crea il primo effetto per un item!
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Effetto</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Durata</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemEffects.map((effect) => {
            const [prefix, specific] = effect.effect_type.split(':');
            const isLoading = loading === effect.item_effect_id;
            
            return (
              <TableRow key={effect.item_effect_id} className={!effect.is_active ? 'opacity-50' : ''}>
                <TableCell className="font-medium">
                  {effect.item_name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {prefix}
                    </Badge>
                    <span className="text-sm">{specific?.replace(/_/g, ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {effect.trigger_on}
                  </Badge>
                </TableCell>
                <TableCell>
                  {effect.duration_minutes 
                    ? `${effect.duration_minutes} min` 
                    : <span className="text-muted-foreground">Permanente</span>}
                </TableCell>
                <TableCell>
                  {effect.is_active ? (
                    <Badge variant="default" className="bg-green-600">Attivo</Badge>
                  ) : (
                    <Badge variant="secondary">Disabilitato</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(effect.item_effect_id, effect.is_active)}
                      disabled={isLoading}
                      title={effect.is_active ? 'Disabilita' : 'Abilita'}
                    >
                      {effect.is_active ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      title="Modifica (WIP)"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(effect.item_effect_id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}