import type { MemberBalance } from '@/lib/types';
import { BalanceCard } from './BalanceCard';

export function BalanceSummary({ member_balances }: { member_balances: MemberBalance[] }) {
  if (member_balances.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-6">Add members and bets to see balances.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {member_balances.map((mb) => (
        <BalanceCard key={mb.member.id} mb={mb} />
      ))}
    </div>
  );
}
