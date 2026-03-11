import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, createMember } from '@/lib/queries';

export async function GET() {
  try {
    const members = await getAllMembers();
    return NextResponse.json(members);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const member = await createMember(name);
    return NextResponse.json(member, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'A member with that name already exists' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
