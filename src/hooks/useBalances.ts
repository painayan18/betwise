import useSWR from 'swr';
import type { BalancesResponse } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

export function useBalances() {
  const { data, error, isLoading, mutate } = useSWR<BalancesResponse>('/api/balances', fetcher);
  return { balances: data, error, isLoading, mutateBalances: mutate };
}
