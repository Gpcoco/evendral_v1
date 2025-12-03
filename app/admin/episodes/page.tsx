import { getEpisodes, createEpisode, deleteEpisode } from '@/lib/actions/episodes-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default async function AdminEpisodesPage() {
  const episodes = await getEpisodes();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Episodes Management</h1>
      
      {/* Create Form */}
      <div className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Episode</h2>
        <form action={createEpisode} className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name*</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="slug">Slug*</Label>
            <Input id="slug" name="slug" required placeholder="episode-1" />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea 
              id="description" 
              name="description" 
              className="w-full border rounded px-3 py-2 min-h-20"
            />
          </div>
          <div>
            <Label htmlFor="start_datetime">Start Date & Time*</Label>
            <Input id="start_datetime" name="start_datetime" type="datetime-local" required />
          </div>
          <div>
            <Label htmlFor="end_datetime">End Date & Time*</Label>
            <Input id="end_datetime" name="end_datetime" type="datetime-local" required />
          </div>
          <div>
            <Label htmlFor="max_players">Max Players</Label>
            <Input id="max_players" name="max_players" type="number" placeholder="Optional" />
          </div>
          <div className="col-span-2">
            <Button type="submit">Create Episode</Button>
          </div>
        </form>
      </div>

      {/* Episodes Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Start Date</th>
              <th className="text-left p-4">Max Players</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((episode) => (
              <tr key={episode.episode_id} className="border-t">
                <td className="p-4">{episode.name}</td>
                <td className="p-4 text-muted-foreground">{episode.slug}</td>
                <td className="p-4">{new Date(episode.start_datetime).toLocaleDateString()}</td>
                <td className="p-4">{episode.max_players || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    episode.is_published ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}>
                    {episode.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <Link href={`/admin/episodes/${episode.episode_id}`}>
                    <Button variant="outline" size="sm">Manage Nodes</Button>
                  </Link>
                  <form action={deleteEpisode.bind(null, episode.episode_id)} className="inline">
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