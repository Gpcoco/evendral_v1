import { getItems, deleteItem } from '@/lib/actions/items-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Trash2, Sparkles } from 'lucide-react';
import { ItemCreateForm } from '@/components/admin/item-create-form';
import Image from 'next/image';

const rarityColors = {
  common: 'from-slate-500 to-slate-600',
  uncommon: 'from-green-500 to-emerald-600',
  rare: 'from-blue-500 to-cyan-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-amber-500 to-orange-600'
};

export default async function AdminItemsPage() {
  const items = await getItems();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Items Management
            </h1>
          </div>
          <p className="text-slate-400">Gestione catalogo oggetti di gioco</p>
        </div>

        {/* Create Form */}
        <ItemCreateForm />

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Catalogo Items ({items.length})
          </h2>
          
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">Immagine</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Nome</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Categoria</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Rarità</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Stackable</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Valore</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.item_id} className="border-t border-slate-700 hover:bg-slate-900/30">
                        <td className="p-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900/50 border border-slate-700 flex items-center justify-center">
                            {item.icon_url ? (
                              <Image 
                                src={item.icon_url} 
                                alt={item.name}
                                width={64}
                                height={64}
                                className="object-contain"
                                unoptimized
                              />
                            ) : (
                              <Package className="w-8 h-8 text-slate-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">{item.name}</span>
                        </td>
                        <td className="p-4 text-slate-300">{item.category || '-'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${
                            rarityColors[item.rarity as keyof typeof rarityColors]
                          } text-white inline-flex items-center gap-1`}>
                            <Sparkles className="w-3 h-3" />
                            {item.rarity}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">
                          {item.is_stackable ? (
                            <span className="text-green-400">✓ Sì</span>
                          ) : (
                            <span className="text-slate-500">✗ No</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-300">{item.base_value || '-'}</td>
                        <td className="p-4">
                          <form action={deleteItem.bind(null, item.item_id)}>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {items.map((item) => (
              <Card key={item.item_id} className="bg-slate-800/60 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900/50 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      {item.icon_url ? (
                        <Image 
                          src={item.icon_url} 
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{item.name}</h3>
                          <p className="text-sm text-slate-400">{item.category || 'Nessuna categoria'}</p>
                        </div>
                        <form action={deleteItem.bind(null, item.item_id)}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Rarità</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${
                            rarityColors[item.rarity as keyof typeof rarityColors]
                          } text-white inline-flex items-center gap-1`}>
                            <Sparkles className="w-3 h-3" />
                            {item.rarity}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Stackable</span>
                          <span className={item.is_stackable ? 'text-green-400' : 'text-slate-500'}>
                            {item.is_stackable ? '✓ Sì' : '✗ No'}
                          </span>
                        </div>
                        
                        {item.base_value && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Valore</span>
                            <span className="text-white font-medium">{item.base_value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}