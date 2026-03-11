'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBets } from '@/hooks/useBets';
import { useMembers } from '@/hooks/useMembers';
import { useBalances } from '@/hooks/useBalances';
import { BetList } from '@/components/bets/BetList';
import { BetForm } from '@/components/bets/BetForm';
import { SettleBetModal } from '@/components/bets/SettleBetModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Bet } from '@/lib/types';

export default function BetsPage() {
  const { bets, isLoading, mutateBets } = useBets();
  const { members } = useMembers();
  const { mutateBalances } = useBalances();
  const [showForm, setShowForm] = useState(false);
  const [settleBet, setSettleBet] = useState<Bet | null>(null);

  async function handleDelete(bet: Bet) {
    await fetch(`/api/bets/${bet.id}`, { method: 'DELETE' });
    mutateBets();
    mutateBalances();
  }

  function handleSuccess() {
    mutateBets();
    mutateBalances();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-100">Bets</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Bet
        </Button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <BetList
          bets={bets}
          onSettle={setSettleBet}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <Modal title="New Bet" onClose={() => setShowForm(false)}>
          <BetForm
            members={members}
            onClose={() => setShowForm(false)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}

      {settleBet && (
        <Modal title="Settle Bet" onClose={() => setSettleBet(null)}>
          <SettleBetModal
            bet={settleBet}
            onClose={() => setSettleBet(null)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}
    </div>
  );
}
