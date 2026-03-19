import { NextRequest, NextResponse } from 'next/server';
import { getBetById, settleBet, updateBet, deleteBet } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bet = await getBetById(Number(id));
    if (!bet) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(bet);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch bet' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let bet;
    if (body.status === 'won' || body.status === 'lost') {
      // Settlement update
      const total_winnings = Number(body.total_winnings ?? 0);
      bet = await settleBet(Number(id), { status: body.status, total_winnings });
    } else {
      // Metadata update
      bet = await updateBet(Number(id), {
        description: body.description,
        placed_by: body.placed_by,
        total_cost: body.total_cost !== undefined ? Number(body.total_cost) : undefined,
        notes: body.notes,
        placed_at: body.placed_at,
      });
    }

    return NextResponse.json(bet);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update bet' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBet(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete bet' }, { status: 500 });
  }
}
