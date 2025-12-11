// /app/admin/item-effects/page.tsx

import { getAllItemEffects } from '@/lib/actions/item-effects';
import { ItemEffectsTable } from './_components/item-effects-table';
import { CreateItemEffectDialog } from './_components/create-item-effect-dialog';

export const dynamic = 'force-dynamic';

export default async function AdminItemEffectsPage() {
  const itemEffects = await getAllItemEffects();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestione Effetti Items</h1>
          <p className="text-muted-foreground mt-1">
            Configura quali effetti vengono applicati quando un player interagisce con un item
          </p>
        </div>
        <CreateItemEffectDialog />
      </div>

      <ItemEffectsTable itemEffects={itemEffects} />
    </div>
  );
}