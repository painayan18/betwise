import type { BetStatus } from '@/lib/types';

const styles: Record<BetStatus, string> = {
  pending: 'bg-amber-900/40 text-amber-400',
  won: 'bg-green-900/40 text-green-400',
  lost: 'bg-red-900/40 text-red-400',
};

const labels: Record<BetStatus, string> = {
  pending: 'Pending',
  won: 'Won',
  lost: 'Lost',
};

export function StatusBadge({ status }: { status: BetStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
