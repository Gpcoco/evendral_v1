import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getPlayerByUserId } from "@/lib/actions/player-actions";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect intelligente
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const player = await getPlayerByUserId(user.id);
      
      if (player) {
        return NextResponse.redirect(`${origin}/player/profile`);
      } else {
        return NextResponse.redirect(`${origin}/onboarding/player`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/protected`);
}