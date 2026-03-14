'use client';

import { useBalances } from '@/hooks/useBalances';
import { BalanceSummary } from '@/components/balances/BalanceSummary';
import { DebtList } from '@/components/balances/DebtList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function BalancesPage() {
  const { balances, isLoading } = useBalances();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100 mb-4">Profits</h1>
        <BalanceSummary member_balances={balances?.member_balances ?? []} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Who Pays Whom
        </h2>
        <DebtList debts={balances?.debts ?? []} />
      </div>
    </div>
  );
}
