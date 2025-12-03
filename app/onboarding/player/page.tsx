import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createPlayer, getPlayerByUserId } from '@/lib/actions/player-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');
  
  // Se già ha player, redirect a profilo
  const existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) redirect('/player/profile');

  return (
    <div className="container max-w-md mx-auto py-16">
      <div className="bg-card p-8 rounded-lg border">
        <h1 className="text-2xl font-bold mb-2">Welcome to Evendral!</h1>
        <p className="text-muted-foreground mb-6">Create your character to begin your adventure.</p>
        
        <form action={createPlayer} className="space-y-4">
          <div>
            <Label htmlFor="display_name">Character Name*</Label>
            <Input 
              id="display_name" 
              name="display_name" 
              required 
              placeholder="Enter your character name"
              maxLength={50}
            />
          </div>
          
          <Button type="submit" className="w-full">Create Character</Button>
        </form>
      </div>
    </div>
  );
}