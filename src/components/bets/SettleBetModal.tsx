'use client';

import { useState, FormEvent } from 'react';
import type { Bet } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SettleBetModalProps {
  bet: Bet;
  onClose: () => void;
  onSuccess: () => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function SettleBetModal({ bet, onClose, onSuccess }: SettleBetModalProps) {
  const [outcome, setOutcome] = useState<'won' | 'lost'>('won');
  const [winnings, setWinnings] = useState('');
  const [amountLost, setAmountLost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const count = bet.participants.length || 1;
  const costPerPerson = bet.total_cost / count;

  // For losses: total_winnings = total_cost - amountLost (the amount returned)
  const lossValue = amountLost ? Math.min(Number(amountLost), bet.total_cost) : bet.total_cost;
  const returnedOnLoss = bet.total_cost - lossValue;
  const returnedPerPerson = returnedOnLoss / count;

  const winPerPerson = outcome === 'won' && winnings ? Number(winnings) / count : 0;
  const netPerPerson = outcome === 'won'
    ? winPerPerson - costPerPerson
    : returnedPerPerson - costPerPerson;

  const showPreview = outcome === 'lost' || (outcome === 'won' && !!winnings);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (outcome === 'won' && (!winnings || Number(winnings) <= 0)) {
      setError('Enter total winnings amount');
      return;
    }
    if (outcome === 'lost' && (!amountLost || Number(amountLost) <= 0)) {
      setError('Enter amount lost');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const total_winnings = outcome === 'won'
        ? Number(winnings)
        : returnedOnLoss;
      const res = await fetch(`/api/bets/${bet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: outcome, total_winnings }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to settle bet');
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-3 text-sm">
        <p className="font-medium text-gray-200">{bet.description}</p>
        <p className="text-gray-400 mt-0.5">
          Total cost: {fmt(bet.total_cost)} · {count} participants · {fmt(costPerPerson)}/person
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Outcome</p>
        <div className="flex gap-2">
          {(['won', 'lost'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setOutcome(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border-2 ${
                outcome === v
                  ? v === 'won'
                    ? 'border-green-500 bg-green-900/40 text-green-400'
                    : 'border-red-500 bg-red-900/20 text-red-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              {v === 'won' ? '🏆 Won' : '💸 Lost'}
            </button>
          ))}
        </div>
      </div>

      {outcome === 'won' && (
        <Input
          label="Total winnings ($)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="900.00"
          value={winnings}
          onChange={(e) => setWinnings(e.target.value)}
          required
        />
      )}

      {outcome === 'lost' && (
        <Input
          label="Amount lost ($)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder={bet.total_cost.toFixed(2)}
          value={amountLost}
          onChange={(e) => setAmountLost(e.target.value)}
          required
        />
      )}

      {showPreview && (
        <div className={`rounded-xl p-3 text-sm ${netPerPerson >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <p className="font-medium text-gray-300 mb-1">Per-person summary</p>
          {outcome === 'won' && winnings && (
            <p className="text-gray-400">Winnings: <strong>{fmt(winPerPerson)}</strong>/person</p>
          )}
          {outcome === 'lost' && amountLost && returnedOnLoss > 0 && (
            <p className="text-gray-400">Returned: <strong>{fmt(returnedPerPerson)}</strong>/person</p>
          )}
          <p className="text-gray-400">Cost: <strong>-{fmt(costPerPerson)}</strong>/person</p>
          <p className={`font-semibold mt-1 ${netPerPerson >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Net: {netPerPerson >= 0 ? '+' : ''}{fmt(netPerPerson)}/person
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving…' : 'Confirm'}
        </Button>
      </div>
    </form>
  );
}
