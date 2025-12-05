'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ItemImageUpload } from './item-image-upload';
import { createItem } from '@/lib/actions/items-actions';
import type { ItemRarity } from '@/lib/types/database';

export function ItemCreateForm() {
  const [imageUrl, setImageUrl] = useState('');

  async function handleSubmit(formData: FormData) {
    // Add image URL to form data
    formData.set('icon_url', imageUrl);
    
    await createItem({
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string || null,
      rarity: (formData.get('rarity') as ItemRarity) || 'common',
      icon_url: imageUrl || null,
      base_value: formData.get('base_value') ? parseInt(formData.get('base_value') as string) : null,
      max_stack: parseInt(formData.get('max_stack') as string) || 99,
      is_stackable: formData.get('is_stackable') === 'on',
      is_consumable: formData.get('is_consumable') === 'on',
      custom_data: {},
      adventure_id: null,
      episode_id: null,
    });

    // Reset form
    setImageUrl('');
    window.location.reload();
  }

  return (
    <Card className="bg-slate-800/60 border-slate-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Plus className="w-5 h-5" />
          Crea Nuovo Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Upload - Full Width */}
          <div className="md:col-span-2">
            <ItemImageUpload 
              onImageUploaded={setImageUrl}
              currentImageUrl={imageUrl}
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-slate-300">Nome*</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="Es. Pozione Curativa"
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-slate-300">Categoria</Label>
            <Input 
              id="category" 
              name="category" 
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="Es. Consumabile"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="description" className="text-slate-300">Descrizione</Label>
            <Input 
              id="description" 
              name="description" 
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="Descrizione dell'oggetto"
            />
          </div>
          
          <div>
            <Label htmlFor="rarity" className="text-slate-300">Rarità</Label>
            <select 
              id="rarity" 
              name="rarity" 
              className="w-full bg-slate-900/50 border border-slate-600 rounded-md px-3 py-2 text-white"
            >
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="base_value" className="text-slate-300">Valore Base</Label>
            <Input 
              id="base_value" 
              name="base_value" 
              type="number" 
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="100"
            />
          </div>
          
          <div>
            <Label htmlFor="max_stack" className="text-slate-300">Max Stack</Label>
            <Input 
              id="max_stack" 
              name="max_stack" 
              type="number" 
              defaultValue={99}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                name="is_stackable" 
                defaultChecked 
                className="w-4 h-4 rounded bg-slate-900/50 border-slate-600"
              />
              Stackable
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                name="is_consumable" 
                className="w-4 h-4 rounded bg-slate-900/50 border-slate-600"
              />
              Consumable
            </label>
          </div>
          
          <div className="md:col-span-2">
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Item
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}