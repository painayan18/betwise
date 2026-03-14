import type { MemberBalance } from '@/lib/types';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function BalanceCard({ mb }: { mb: MemberBalance }) {
  const profit = mb.total_won - mb.total_staked;
  const positive = profit >= 0;
  return (
    <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 p-6">
      <p className="text-lg font-semibold text-gray-200">{mb.member.name}</p>
      <p className={`text-4xl font-bold mt-2 ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {positive ? '+' : ''}{fmt(profit)}
      </p>
      <div className="mt-4 flex gap-6 text-sm text-gray-500">
        <p>Staked: <span className="text-gray-400">{fmt(mb.total_staked)}</span></p>
        <p>Won: <span className="text-gray-400">{fmt(mb.total_won)}</span></p>
      </div>
    </div>
  );
}
