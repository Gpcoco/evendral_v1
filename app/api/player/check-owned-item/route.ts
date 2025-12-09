import { NextRequest, NextResponse } from 'next/server';
import { checkOwnedItem } from '@/lib/actions/target-validation-actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const playerId = searchParams.get('playerId');
    const episodeId = searchParams.get('episodeId');
    const targetId = searchParams.get('targetId');

    // Validate required fields
    if (!playerId || !episodeId || !targetId) {
      return NextResponse.json(
        { owned: false, itemName: 'Unknown', error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    // Call Server Action
    const result = await checkOwnedItem(playerId, episodeId, targetId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in check-owned-item API:', error);
    return NextResponse.json(
      { owned: false, itemName: 'Unknown', error: 'Errore del server' },
      { status: 500 }
    );
  }
}