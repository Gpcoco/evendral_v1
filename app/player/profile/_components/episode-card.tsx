'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Episode {
  episode_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  start_datetime: string;
}

interface Props {
  episode: Episode;
}

export function EpisodeCard({ episode }: Props) {
  const startDate = new Date(episode.start_datetime);
  const isUpcoming = startDate > new Date();
  
  return (
    <Card className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 transition-all hover:scale-[1.02] overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-slate-900/50 flex-shrink-0 overflow-hidden">
            {episode.cover_image_url ? (
              <Image
                src={episode.cover_image_url}
                alt={episode.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🎭
              </div>
            )}
            {isUpcoming && (
              <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                In Arrivo
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              {episode.name}
            </h3>
            
            {episode.description && (
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {episode.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{startDate.toLocaleDateString('it-IT', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Evento dal vivo</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <Link href={`/player/episodes/${episode.episode_id}`}>
                <Button 
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Gioca Ora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}