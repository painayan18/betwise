import { NextRequest, NextResponse } from 'next/server';
import { deleteMember } from '@/lib/queries';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMember(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
