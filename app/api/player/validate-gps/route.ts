import { NextRequest, NextResponse } from 'next/server';
import { validateGpsLocation } from '@/lib/actions/target-validation-actions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const playerId = formData.get('playerId') as string;
    const episodeId = formData.get('episodeId') as string;
    const nodeId = formData.get('nodeId') as string;
    const targetId = formData.get('targetId') as string;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);

    // Validate required fields
    if (!playerId || !episodeId || !nodeId || !targetId || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, message: 'Parametri mancanti o non validi' },
        { status: 400 }
      );
    }

    // Call Server Action
    const result = await validateGpsLocation(
      playerId,
      episodeId,
      nodeId,
      targetId,
      lat,
      lng
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in validate-gps API:', error);
    return NextResponse.json(
      { success: false, message: 'Errore del server' },
      { status: 500 }
    );
  }
}