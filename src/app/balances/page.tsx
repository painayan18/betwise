'use client';

import { useBalances } from '@/hooks/useBalances';
import { BalanceSummary } from '@/components/balances/BalanceSummary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function BalancesPage() {
  const { balances, isLoading } = useBalances();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-4">Profits</h1>
      <BalanceSummary member_balances={balances?.member_balances ?? []} />
    </div>
  );
}
