import { NextRequest, NextResponse } from 'next/server';
import { initSchema } from '@/lib/db';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-init-secret');
  if (!secret || secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await initSchema();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Schema init failed' }, { status: 500 });
  }
}
