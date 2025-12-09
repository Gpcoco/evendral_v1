// /app/admin/progress-items/page.tsx
import { getProgressItemsByEpisode } from '@/lib/actions/progress-items-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Trash2, Link2 } from 'lucide-react';
import { ProgressItemCreateForm } from '@/components/admin/progress-item-create-form';
import { deleteProgressItem } from '@/lib/actions/progress-items-actions';
import { createClient } from '@/lib/supabase/server';
import { EpisodeFilter } from './_components/episode-filter';

interface PageProps {
  searchParams: Promise<{ episode?: string }>;
}

export default async function AdminProgressItemsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedEpisodeId = params.episode;

  // Get all episodes for filter
  const supabase = await createClient();
  const { data: episodes } = await supabase
    .from('episodes')
    .select('episode_id, name, episode_number')
    .order('episode_number', { ascending: true });

  // Get progress items if episode is selected
  const progressItems = selectedEpisodeId 
    ? await getProgressItemsByEpisode(selectedEpisodeId)
    : [];

  const selectedEpisode = episodes?.find(e => e.episode_id === selectedEpisodeId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Progress Items Management
            </h1>
          </div>
          <p className="text-slate-400">Gestione item di tracciamento progressione (invisibili al giocatore)</p>
        </div>

        {/* Episode Filter */}
        <EpisodeFilter episodes={episodes || []} selectedEpisodeId={selectedEpisodeId} />

        {/* Create Form - shown only if episode selected */}
        {selectedEpisodeId && <ProgressItemCreateForm />}

        {/* Progress Items List */}
        {selectedEpisodeId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Progress Items - {selectedEpisode?.name} ({progressItems.length})
              </h2>
            </div>
            
            {progressItems.length === 0 ? (
              <Card className="bg-slate-800/60 border-slate-700">
                <CardContent className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nessun progress item per questo episodio</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-900/50">
                          <tr>
                            <th className="text-left p-4 text-slate-300 font-medium">Nome</th>
                            <th className="text-left p-4 text-slate-300 font-medium">Descrizione</th>
                            <th className="text-left p-4 text-slate-300 font-medium">Nodo Collegato</th>
                            <th className="text-left p-4 text-slate-300 font-medium">Creato</th>
                            <th className="text-left p-4 text-slate-300 font-medium">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progressItems.map((item) => (
                            <tr key={item.progress_item_id} className="border-t border-slate-700 hover:bg-slate-900/30">
                              <td className="p-4">
                                <span className="text-white font-medium">{item.name}</span>
                              </td>
                              <td className="p-4 text-slate-300">
                                {item.description || '-'}
                              </td>
                              <td className="p-4">
                                {item.content_nodes ? (
                                  <div className="flex items-center gap-2 text-amber-400">
                                    <Link2 className="w-4 h-4" />
                                    <span className="text-sm">{item.content_nodes.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 text-sm">Nessun nodo</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-400 text-sm">
                                {new Date(item.created_at).toLocaleDateString('it-IT')}
                              </td>
                              <td className="p-4">
                                <form action={deleteProgressItem.bind(null, item.progress_item_id)}>
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
                  {progressItems.map((item) => (
                    <Card key={item.progress_item_id} className="bg-slate-800/60 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                            <p className="text-sm text-slate-400">
                              {item.description || 'Nessuna descrizione'}
                            </p>
                          </div>
                          <form action={deleteProgressItem.bind(null, item.progress_item_id)}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                        
                        <div className="space-y-2 pt-3 border-t border-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Nodo</span>
                            {item.content_nodes ? (
                              <div className="flex items-center gap-2 text-amber-400">
                                <Link2 className="w-3 h-3" />
                                <span className="text-sm">{item.content_nodes.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-sm">Nessuno</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Creato</span>
                            <span className="text-sm text-white">
                              {new Date(item.created_at).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-12 text-center">
              <CheckSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Seleziona un Episodio
              </h3>
              <p className="text-slate-400">
                Scegli un episodio dal menu a tendina per vedere e gestire i suoi progress items
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}