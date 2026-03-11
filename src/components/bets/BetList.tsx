import type { Bet } from '@/lib/types';
import { BetCard } from './BetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket } from 'lucide-react';

interface BetListProps {
  bets: Bet[];
  onSettle: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
}

export function BetList({ bets, onSettle, onDelete }: BetListProps) {
  if (bets.length === 0) {
    return (
      <EmptyState
        icon={<Ticket />}
        title="No bets yet"
        description="Add your first bet using the button above."
      />
    );
  }

  const pending = bets.filter((b) => b.status === 'pending');
  const settled = bets.filter((b) => b.status !== 'pending');

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Active</h3>
          <div className="space-y-2">
            {pending.map((bet) => (
              <BetCard key={bet.id} bet={bet} onSettle={onSettle} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}
      {settled.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Settled</h3>
          <div className="space-y-2">
            {settled.map((bet) => (
              <BetCard key={bet.id} bet={bet} onSettle={onSettle} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
