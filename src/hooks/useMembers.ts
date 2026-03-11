import useSWR from 'swr';
import type { Member } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
});

export function useMembers() {
  const { data, error, isLoading, mutate } = useSWR<Member[]>('/api/members', fetcher);
  return { members: data ?? [], error, isLoading, mutateMembers: mutate };
}
