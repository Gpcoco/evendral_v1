'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Condition, Target, Effect } from '@/lib/types/database';
import { 
  createCondition, 
  createTarget, 
  createEffect,
  deleteCondition,
  deleteTarget,
  deleteEffect 
} from '@/lib/actions/node-logic-actions';

interface Props {
  nodeId: string;
  nodeName: string;
  episodeId: string;
  conditions: Condition[];
  targets: Target[];
  effects: Effect[];
  progressItems: Array<{progress_item_id: string, name: string}>;
  inventoryItems: Array<{item_id: string, name: string}>;
  achievements: Array<{achievement_id: string, name: string}>;
}

export function NodeLogicDialog({ 
  nodeId, nodeName, episodeId, conditions, targets, effects,
  progressItems, inventoryItems, achievements
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Condition form state
  const [conditionType, setConditionType] = useState('completed_progress');
  const [checkQuantity, setCheckQuantity] = useState(false);
  
  // Target form state
  const [targetType, setTargetType] = useState('gps_location');
  
  // Effect form state
  const [effectType, setEffectType] = useState('grant_progress_item');
  const [hasEffectDuration, setHasEffectDuration] = useState(false);

  const handleSubmitCondition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Salva riferimento
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

    startTransition(async () => {
      await createCondition(nodeId, episodeId, conditionType, JSON.stringify(payload));
      form.reset();
    });
  };

  const handleSubmitTarget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
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
      case 'qr_scan':
        payload = { qr_code: formData.get('qr_code') };
        break;
      case 'code_entry':
        payload = { code: formData.get('code') };
        break;
    }

    startTransition(async () => {
      await createTarget(nodeId, episodeId, targetType, JSON.stringify(payload));
      form.reset();
    });
  };

  const handleSubmitEffect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
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
        if (hasEffectDuration) {
          payload.duration_minutes = parseInt(formData.get('duration_minutes') as string);
        }
        break;
    }

    startTransition(async () => {
      await createEffect(nodeId, episodeId, effectType, JSON.stringify(payload));
      form.reset();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Logic</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{nodeName} - Game Logic</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="conditions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conditions">Conditions ({conditions.length})</TabsTrigger>
            <TabsTrigger value="targets">Targets ({targets.length})</TabsTrigger>
            <TabsTrigger value="effects">Effects ({effects.length})</TabsTrigger>
          </TabsList>

          {/* CONDITIONS TAB */}
          <TabsContent value="conditions" className="space-y-4">
            <form onSubmit={handleSubmitCondition} className="space-y-3 p-4 border rounded">
              <div>
                <Label>Condition Type</Label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value)}
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

              {conditionType === 'completed_progress' && (
                <div>
                  <Label>Progress Item</Label>
                  <select name="progress_item_id" className="w-full border rounded px-3 py-2" required>
                    <option value="">Select...</option>
                    {progressItems.map(item => (
                      <option key={item.progress_item_id} value={item.progress_item_id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {conditionType === 'player_experience' && (
                <div>
                  <Label>Minimum Experience</Label>
                  <Input name="min_experience" type="number" required placeholder="100" />
                </div>
              )}

              {conditionType === 'player_level' && (
                <div>
                  <Label>Minimum Level</Label>
                  <Input name="min_level" type="number" required placeholder="5" />
                </div>
              )}

              {conditionType === 'has_inventory_item' && (
                <>
                  <div>
                    <Label>Inventory Item</Label>
                    <select name="item_id" className="w-full border rounded px-3 py-2" required>
                      <option value="">Select...</option>
                      {inventoryItems.map(item => (
                        <option key={item.item_id} value={item.item_id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="check-qty"
                      checked={checkQuantity}
                      onChange={(e) => setCheckQuantity(e.target.checked)}
                    />
                    <Label htmlFor="check-qty">Check Quantity</Label>
                  </div>
                  {checkQuantity && (
                    <div>
                      <Label>Minimum Quantity</Label>
                      <Input name="min_quantity" type="number" placeholder="1" />
                    </div>
                  )}
                </>
              )}

              {conditionType === 'has_achievement' && (
                <div>
                  <Label>Achievement</Label>
                  <select name="achievement_id" className="w-full border rounded px-3 py-2" required>
                    <option value="">Select...</option>
                    {achievements.map(ach => (
                      <option key={ach.achievement_id} value={ach.achievement_id}>
                        {ach.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {conditionType === 'has_status_effect' && (
                <div>
                  <Label>Status Type</Label>
                  <Input name="status_type" required placeholder="poisoned" />
                </div>
              )}

              {conditionType === 'gps_location' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Latitude</Label>
                      <Input name="lat" type="number" step="any" required placeholder="45.6495" />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input name="lng" type="number" step="any" required placeholder="13.7768" />
                    </div>
                  </div>
                  <div>
                    <Label>Radius (meters)</Label>
                    <Input name="radius" type="number" required placeholder="50" />
                  </div>
                </>
              )}

              <Button type="submit" disabled={isPending}>Add Condition</Button>
            </form>

            <div className="space-y-2">
              {conditions.map((c) => (
                <div key={c.condition_id} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{c.type}</div>
                    <code className="text-xs text-muted-foreground">{JSON.stringify(c.payload)}</code>
                  </div>
                  <form action={() => startTransition(() => deleteCondition(c.condition_id, episodeId))}>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TARGETS TAB */}
          <TabsContent value="targets" className="space-y-4">
            <form onSubmit={handleSubmitTarget} className="space-y-3 p-4 border rounded">
              <div>
                <Label>Target Type</Label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                >
                  <option value="gps_location">GPS Location</option>
                  <option value="qr_scan">QR Scan</option>
                  <option value="code_entry">Code Entry</option>
                </select>
              </div>

              {targetType === 'gps_location' && (
                <>
                  <div>
                    <Label>Location Name</Label>
                    <Input name="name" required placeholder="Central Square" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Latitude</Label>
                      <Input name="lat" type="number" step="any" required placeholder="45.6495" />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input name="lng" type="number" step="any" required placeholder="13.7768" />
                    </div>
                  </div>
                  <div>
                    <Label>Radius (meters)</Label>
                    <Input name="radius" type="number" required placeholder="50" />
                  </div>
                </>
              )}

              {targetType === 'qr_scan' && (
                <div>
                  <Label>QR Code Data</Label>
                  <Input name="qr_code" required placeholder="QUEST_001" />
                </div>
              )}

              {targetType === 'code_entry' && (
                <div>
                  <Label>Secret Code</Label>
                  <Input name="code" required placeholder="DRAGON123" />
                </div>
              )}

              <Button type="submit" disabled={isPending}>Add Target</Button>
            </form>

            <div className="space-y-2">
              {targets.map((t) => (
                <div key={t.target_id} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{t.type}</div>
                    <code className="text-xs text-muted-foreground block">ID: {t.target_id}</code>
                    <code className="text-xs text-muted-foreground">{JSON.stringify(t.payload)}</code>
                  </div>
                  <form action={() => startTransition(() => deleteTarget(t.target_id, episodeId))}>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* EFFECTS TAB */}
          <TabsContent value="effects" className="space-y-4">
            <form onSubmit={handleSubmitEffect} className="space-y-3 p-4 border rounded">
              <div>
                <Label>Effect Type</Label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={effectType}
                  onChange={(e) => setEffectType(e.target.value)}
                >
                  <option value="grant_progress_item">Grant Progress Item</option>
                  <option value="grant_inventory_item">Grant Inventory Item</option>
                  <option value="modify_experience">Modify Experience</option>
                  <option value="modify_level">Modify Level</option>
                  <option value="grant_achievement">Grant Achievement</option>
                  <option value="add_status_effect">Add Status Effect</option>
                </select>
              </div>

              {effectType === 'grant_progress_item' && (
                <div>
                  <Label>Progress Item</Label>
                  <select name="progress_item_id" className="w-full border rounded px-3 py-2" required>
                    <option value="">Select...</option>
                    {progressItems.map(item => (
                      <option key={item.progress_item_id} value={item.progress_item_id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {effectType === 'grant_inventory_item' && (
                <>
                  <div>
                    <Label>Inventory Item</Label>
                    <select name="item_id" className="w-full border rounded px-3 py-2" required>
                      <option value="">Select...</option>
                      {inventoryItems.map(item => (
                        <option key={item.item_id} value={item.item_id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input name="quantity" type="number" defaultValue={1} required />
                  </div>
                </>
              )}

              {effectType === 'modify_experience' && (
                <div>
                  <Label>Experience Amount</Label>
                  <Input name="amount" type="number" required placeholder="100" />
                </div>
              )}

              {effectType === 'modify_level' && (
                <div>
                  <Label>Level Amount</Label>
                  <Input name="amount" type="number" required placeholder="1" />
                </div>
              )}

              {effectType === 'grant_achievement' && (
                <div>
                  <Label>Achievement</Label>
                  <select name="achievement_id" className="w-full border rounded px-3 py-2" required>
                    <option value="">Select...</option>
                    {achievements.map(ach => (
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
                    <Label>Status Type</Label>
                    <Input name="status_type" required placeholder="speed_boost" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="has-duration"
                      checked={hasEffectDuration}
                      onChange={(e) => setHasEffectDuration(e.target.checked)}
                    />
                    <Label htmlFor="has-duration">Has Duration</Label>
                  </div>
                  {hasEffectDuration && (
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input name="duration_minutes" type="number" placeholder="30" />
                    </div>
                  )}
                </>
              )}

              <Button type="submit" disabled={isPending}>Add Effect</Button>
            </form>

            <div className="space-y-2">
              {effects.map((e) => (
                <div key={e.effect_id} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{e.type}</div>
                    <code className="text-xs text-muted-foreground">{JSON.stringify(e.payload)}</code>
                  </div>
                  <form action={() => startTransition(() => deleteEffect(e.effect_id, episodeId))}>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}