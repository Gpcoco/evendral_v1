import { NextRequest, NextResponse } from 'next/server';
import { validateOwnedItem } from '@/lib/actions/target-validation-actions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const playerId = formData.get('playerId') as string;
    const episodeId = formData.get('episodeId') as string;
    const nodeId = formData.get('nodeId') as string;
    const targetId = formData.get('targetId') as string;

    // Validate required fields
    if (!playerId || !episodeId || !nodeId || !targetId) {
      return NextResponse.json(
        { success: false, message: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    // Call Server Action
    const result = await validateOwnedItem(playerId, episodeId, nodeId, targetId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in check-owned-item API:', error);
    return NextResponse.json(
      { success: false, message: 'Errore del server' },
      { status: 500 }
    );
  }
}