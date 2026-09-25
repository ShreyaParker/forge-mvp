import { NextResponse } from 'next/server';
import { extractBriefIntake } from '../../../../services/ai.service';
import { getSession } from '../../../../lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Brief text content is required' }, { status: 400 });
    }

    const extracted = extractBriefIntake(text);

    return NextResponse.json({
      success: true,
      extracted,
    });
  } catch (error: any) {
    console.error('POST /api/projects/intake error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse intake document' },
      { status: 500 }
    );
  }
}
