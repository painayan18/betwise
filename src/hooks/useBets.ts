import useSWR from 'swr';
import type { Bet } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

export function useBets() {
  const { data, error, isLoading, mutate } = useSWR<Bet[]>('/api/bets', fetcher);
  return { bets: data ?? [], error, isLoading, mutateBets: mutate };
}
