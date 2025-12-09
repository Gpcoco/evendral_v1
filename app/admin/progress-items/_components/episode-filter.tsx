// /app/admin/progress-items/_components/episode-filter.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Episode {
  episode_id: string;
  name: string;
  episode_number: number;
}

interface EpisodeFilterProps {
  episodes: Episode[];
  selectedEpisodeId?: string;
}

export function EpisodeFilter({ episodes, selectedEpisodeId }: EpisodeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEpisodeChange = (episodeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (episodeId) {
      params.set('episode', episodeId);
    } else {
      params.delete('episode');
    }
    router.push(`/admin/progress-items?${params.toString()}`);
  };

  return (
    <Card className="bg-slate-800/60 border-slate-700 mb-8">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Filter className="w-5 h-5" />
            <Label className="text-slate-300 font-medium">Filtra per Episodio:</Label>
          </div>
          
          <select
            value={selectedEpisodeId || ''}
            onChange={(e) => handleEpisodeChange(e.target.value)}
            className="flex-1 max-w-md px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Seleziona un episodio</option>
            {episodes.map((ep) => (
              <option key={ep.episode_id} value={ep.episode_id}>
                {ep.name}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}