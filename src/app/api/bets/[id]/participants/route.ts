import { NextRequest, NextResponse } from 'next/server';
import { updateParticipants, getBetById } from '@/lib/queries';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const member_ids = Array.isArray(body.member_ids) ? body.member_ids : [];
    if (member_ids.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }
    await updateParticipants(Number(id), member_ids);
    const bet = await getBetById(Number(id));
    return NextResponse.json(bet);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update participants' }, { status: 500 });
  }
}
