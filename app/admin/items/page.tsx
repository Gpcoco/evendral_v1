import { getItems, createItem, deleteItem } from '@/lib/actions/items-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ItemRarity } from '@/lib/types/database';
import { Label } from '@/components/ui/label';

async function handleCreate(formData: FormData) {
  'use server';
  await createItem({
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    category: formData.get('category') as string || null,
    rarity: (formData.get('rarity') as ItemRarity) || 'common',
    icon_url: formData.get('icon_url') as string || null,
    base_value: formData.get('base_value') ? parseInt(formData.get('base_value') as string) : null,
    max_stack: parseInt(formData.get('max_stack') as string) || 99,
    is_stackable: formData.get('is_stackable') === 'on',
    is_consumable: formData.get('is_consumable') === 'on',
    custom_data: {},
    adventure_id: null,
    episode_id: null,
  });
}

export default async function AdminItemsPage() {
  const items = await getItems();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Items Management</h1>
      
      {/* Create Form */}
      <div className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Item</h2>
        <form action={handleCreate} className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name*</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div>
            <Label htmlFor="rarity">Rarity</Label>
            <select id="rarity" name="rarity" className="w-full border rounded px-3 py-2">
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          <div>
            <Label htmlFor="icon_url">Icon URL</Label>
            <Input id="icon_url" name="icon_url" />
          </div>
          <div>
            <Label htmlFor="base_value">Base Value</Label>
            <Input id="base_value" name="base_value" type="number" />
          </div>
          <div>
            <Label htmlFor="max_stack">Max Stack</Label>
            <Input id="max_stack" name="max_stack" type="number" defaultValue={99} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_stackable" defaultChecked />
              Stackable
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_consumable" />
              Consumable
            </label>
          </div>
          <div className="col-span-2">
            <Button type="submit">Create Item</Button>
          </div>
        </form>
      </div>

      {/* Items Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Rarity</th>
              <th className="text-left p-4">Stackable</th>
              <th className="text-left p-4">Value</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.item_id} className="border-t">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.category || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.rarity === 'legendary' ? 'bg-orange-500' :
                    item.rarity === 'epic' ? 'bg-purple-500' :
                    item.rarity === 'rare' ? 'bg-blue-500' :
                    item.rarity === 'uncommon' ? 'bg-green-500' :
                    'bg-gray-500'
                  } text-white`}>
                    {item.rarity}
                  </span>
                </td>
                <td className="p-4">{item.is_stackable ? 'Yes' : 'No'}</td>
                <td className="p-4">{item.base_value || '-'}</td>
                <td className="p-4">
                  <form action={deleteItem.bind(null, item.item_id)} className="inline">
                    <Button variant="destructive" size="sm">Delete</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}