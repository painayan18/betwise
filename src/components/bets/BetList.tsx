import type { Bet, Member } from '@/lib/types';
import { BetCard } from './BetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket } from 'lucide-react';

interface BetListProps {
  bets: Bet[];
  members: Member[];
  onSettle: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
  onUpdate: () => void;
}

export function BetList({ bets, members, onSettle, onDelete, onUpdate }: BetListProps) {
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
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active</h3>
          <div className="space-y-2">
            {pending.map((bet) => (
              <BetCard key={bet.id} bet={bet} members={members} onSettle={onSettle} onDelete={onDelete} onUpdate={onUpdate} />
            ))}
          </div>
        </section>
      )}
      {settled.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Settled</h3>
          <div className="space-y-2">
            {settled.map((bet) => (
              <BetCard key={bet.id} bet={bet} members={members} onSettle={onSettle} onDelete={onDelete} onUpdate={onUpdate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
