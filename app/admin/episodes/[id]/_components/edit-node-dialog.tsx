'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateNode } from '@/lib/actions/nodes-actions';
import type { ContentNode } from '@/lib/types/database';

interface Props {
  node: ContentNode;
  episodeId: string;
}

export function EditNodeDialog({ node, episodeId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await updateNode(node.node_id, episodeId, formData);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Node Name*</Label>
              <Input 
                id="edit-name" 
                name="name" 
                required 
                defaultValue={node.name}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <select 
                id="edit-category" 
                name="node_category" 
                className="w-full border rounded px-3 py-2"
                defaultValue={node.node_category}
              >
                <option value="main_story">Main Story</option>
                <option value="side_quest">Side Quest</option>
                <option value="tutorial">Tutorial</option>
                <option value="ending">Ending</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="edit-html">Content HTML*</Label>
            <textarea 
              id="edit-html" 
              name="content_html" 
              required
              className="w-full border rounded px-3 py-2 min-h-64 font-mono text-sm"
              defaultValue={node.content_html}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}