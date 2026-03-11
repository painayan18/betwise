import type { MemberBalance } from '@/lib/types';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function BalanceCard({ mb }: { mb: MemberBalance }) {
  const positive = mb.net_balance >= 0;
  return (
    <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 p-4">
      <p className="font-semibold text-gray-200 truncate">{mb.member.name}</p>
      <p className={`text-2xl font-bold mt-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
        {positive ? '+' : ''}{fmt(mb.net_balance)}
      </p>
      <div className="mt-2 space-y-0.5 text-xs text-gray-500">
        <p>Staked: {fmt(mb.total_staked)}</p>
        <p>Won: {fmt(mb.total_won)}</p>
      </div>
    </div>
  );
}
