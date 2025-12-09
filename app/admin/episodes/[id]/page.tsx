import { getNodesByEpisode, deleteNode } from '@/lib/actions/nodes-actions';
import { getNodeLogic } from '@/lib/actions/node-logic-actions';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default async function EpisodeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  
  const { data: episode } = await supabase
    .from('episodes')
    .select('*')
    .eq('episode_id', id)
    .single();
  
  if (!episode) redirect('/admin/episodes');
  
  const nodes = await getNodesByEpisode(id);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/episodes" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Episodes
        </Link>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{episode.name}</h1>
          <p className="text-muted-foreground">Gestisci i nodi di questa episodio</p>
        </div>
        <Link href={`/admin/episodes/${id}/nodes/create`}>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Crea Nuovo Nodo
          </Button>
        </Link>
      </div>

      {/* Nodes list */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-muted">
          <h2 className="text-lg font-semibold">Nodi ({nodes.length})</h2>
        </div>
        
        {nodes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="mb-4">Nessun nodo creato. Inizia creando il tuo primo nodo!</p>
            <Link href={`/admin/episodes/${id}/nodes/create`}>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crea Primo Nodo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {nodes.map(async (node) => {
              const logic = await getNodeLogic(node.node_id);
              
              return (
                <div key={node.node_id} className="p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{node.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                          {node.node_category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(node.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>🔓 {logic.conditions.length} conditions</span>
                        <span>🎯 {logic.targets.length} targets</span>
                        <span>✨ {logic.effects.length} effects</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/episodes/${id}/nodes/${node.node_id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifica
                        </Button>
                      </Link>
                      <form action={deleteNode.bind(null, node.node_id, id)}>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Elimina
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}