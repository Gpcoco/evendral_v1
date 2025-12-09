// /components/admin/progress-item-create-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckSquare, Plus } from 'lucide-react';
import { createProgressItem } from '@/lib/actions/progress-items-actions';
import { createClient } from '@/lib/supabase/client';

interface Episode {
  episode_id: string;
  name: string;
}

interface ContentNode {
  node_id: string;
  name: string;
}

export function ProgressItemCreateForm() {
  const [episodeId, setEpisodeId] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [nodes, setNodes] = useState<ContentNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load episodes on mount
  useEffect(() => {
    const loadEpisodes = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('episodes')
        .select('episode_id, name')
        .order('episode_number', { ascending: true });
      
      if (data) setEpisodes(data);
    };
    loadEpisodes();
  }, []);

  // Load nodes when episode changes
  useEffect(() => {
    if (!episodeId) {
      setNodes([]);
      setNodeId('');
      return;
    }

    const loadNodes = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('content_nodes')
        .select('node_id, name')
        .eq('episode_id', episodeId)
        .order('name', { ascending: true });
      
      if (data) setNodes(data);
    };
    loadNodes();
  }, [episodeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodeId || !name) return;

    setIsSubmitting(true);
    try {
      await createProgressItem({
        episode_id: episodeId,
        node_id: nodeId || null,
        name,
        description: description || null,
      });
      
      // Reset form
      setNodeId('');
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating progress item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-800/60 border-slate-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CheckSquare className="w-5 h-5 text-amber-400" />
          Crea Nuovo Progress Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Episode Select */}
            <div className="space-y-2">
              <Label htmlFor="episode" className="text-slate-300">
                Episodio *
              </Label>
              <select
                id="episode"
                value={episodeId}
                onChange={(e) => setEpisodeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Seleziona episodio</option>
                {episodes.map((ep) => (
                  <option key={ep.episode_id} value={ep.episode_id}>
                    {ep.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Node Select */}
            <div className="space-y-2">
              <Label htmlFor="node" className="text-slate-300">
                Nodo (opzionale)
              </Label>
              <select
                id="node"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                disabled={!episodeId}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Nessun nodo collegato</option>
                {nodes.map((node) => (
                  <option key={node.node_id} value={node.node_id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Chiave dorata trovata"
                className="bg-slate-900/50 border-slate-700 text-white"
                required
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Descrizione
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione opzionale"
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !episodeId || !name}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creazione...' : 'Crea Progress Item'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}