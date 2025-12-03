'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Episode } from '@/lib/types/database';

interface Props {
  episodes: Episode[];
}

export function EpisodesList({ episodes }: Props) {
  return (
    <div className="space-y-4">
      {episodes.map((episode) => (
        <Card key={episode.episode_id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{episode.name}</span>
              <Link href={`/player/episodes/${episode.episode_id}`}>
                <Button variant="outline" size="sm">
                  Play Episode
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          
          {episode.description && (
            <CardContent>
              <p className="text-muted-foreground text-sm">{episode.description}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}