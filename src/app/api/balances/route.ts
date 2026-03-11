import { NextResponse } from 'next/server';
import { getAllMembers, getRawBalanceData } from '@/lib/queries';
import { computeBalances } from '@/lib/balances';

export async function GET() {
  try {
    const [members, rows] = await Promise.all([getAllMembers(), getRawBalanceData()]);
    const balances = computeBalances(rows, members);
    return NextResponse.json(balances);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to compute balances' }, { status: 500 });
  }
}
