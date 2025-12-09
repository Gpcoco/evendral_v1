import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PlayerScript } from './_components/player-script';

export default async function PlayerNodePage({
  params,
}: {
  params: Promise<{ id: string; nodeId: string }>;
}) {
  const { id: episodeId, nodeId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get player ID for this user
  const { data: player } = await supabase
    .from('player')
    .select('player_id')
    .eq('user_id', user.id)
    .single();

  if (!player) {
    redirect('/onboarding/player');
  }

  // Get node content
  const { data: node, error: nodeError } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('node_id', nodeId)
    .eq('episode_id', episodeId)
    .single();

  if (nodeError || !node) {
    redirect(`/player/episodes/${episodeId}`);
  }

  // Get targets for this node
  const { data: targets } = await supabase
    .from('targets')
    .select('*')
    .eq('node_id', nodeId);

  // Get player progress on targets
  const { data: progress } = await supabase
    .from('player_target_progress')
    .select('target_id, completed')
    .eq('player_id', player.player_id)
    .in('target_id', targets?.map(t => t.target_id) || []);

  const completedTargetIds = new Set(
    progress?.filter(p => p.completed).map(p => p.target_id) || []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Client component per lo script */}
      <PlayerScript 
        playerId={player.player_id} 
        episodeId={episodeId} 
        nodeId={nodeId} 
      />

      {/* Styles for target elements */}
      <style>{`
        .evendral-target {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border: 2px solid #475569;
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
        }
        .evendral-target input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #475569;
          background: #0f172a;
          color: white;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .evendral-target input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }
        .evendral-target button {
          background: linear-gradient(90deg, #f59e0b, #ea580c);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .evendral-target button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .evendral-target label {
          display: block;
          color: #fbbf24;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .evendral-target .location-name,
        .evendral-target .item-check {
          color: #fbbf24;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        .evendral-target .location-hint,
        .evendral-target .item-hint {
          color: #94a3b8;
          font-size: 14px;
          margin: 0 0 12px 0;
        }
      `}</style>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <a href={`/player/episodes/${episodeId}`} className="hover:text-amber-400">
              ← Torna all&apos;episodio
            </a>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{node.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
              {node.node_category}
            </span>
          </div>
        </div>

        {/* Progress Indicator */}
        {targets && targets.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-300">
                Obiettivi Completati
              </span>
              <span className="text-sm text-amber-400 font-bold">
                {completedTargetIds.size} / {targets.length}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedTargetIds.size / targets.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Node Content (HTML from admin) */}
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: node.content_html }}
        />

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-800 rounded border border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 mb-2">🔧 Debug Info</h3>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Player ID: {player.player_id}</div>
              <div>Episode ID: {episodeId}</div>
              <div>Node ID: {nodeId}</div>
              <div>Targets: {targets?.length || 0}</div>
              <div>Completed: {completedTargetIds.size}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}