import { NextRequest, NextResponse } from 'next/server';
import { getAllBets, createBet } from '@/lib/queries';
import type { CreateBetRequest } from '@/lib/types';

export async function GET() {
  try {
    const bets = await getAllBets();
    return NextResponse.json(bets);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<CreateBetRequest>;

    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const total_cost = Number(body.total_cost);
    if (isNaN(total_cost) || total_cost <= 0) {
      return NextResponse.json({ error: 'total_cost must be a positive number' }, { status: 400 });
    }

    const participant_ids = Array.isArray(body.participant_ids) ? body.participant_ids : [];
    if (participant_ids.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }

    const data: CreateBetRequest = {
      description,
      placed_by: typeof body.placed_by === 'string' && body.placed_by.trim() ? body.placed_by.trim() : null,
      total_cost,
      notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
      participant_ids,
    };

    const bet = await createBet(data);
    return NextResponse.json(bet, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 });
  }
}
