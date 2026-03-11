'use client';

import { useState, FormEvent } from 'react';
import type { Member } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BetFormProps {
  members: Member[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BetForm({ members, onClose, onSuccess }: BetFormProps) {
  const [description, setDescription] = useState('');
  const [placedBy, setPlacedBy] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [notes, setNotes] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [placedAt, setPlacedAt] = useState(today);
  const [participantIds, setParticipantIds] = useState<number[]>(members.map((m) => m.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const count = participantIds.length;
  const perPerson = totalCost && count > 0 ? Number(totalCost) / count : 0;

  function toggleParticipant(id: number) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) { setError('Description is required'); return; }
    if (!totalCost || Number(totalCost) <= 0) { setError('Enter a valid cost'); return; }
    if (!placedBy) { setError('Select who placed the bet'); return; }
    if (participantIds.length === 0) { setError('Select at least one participant'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          placed_by: placedBy.trim() || null,
          total_cost: Number(totalCost),
          notes: notes.trim() || null,
          placed_at: placedAt,
          participant_ids: participantIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create bet');
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
      <Input
        label="Description"
        placeholder="e.g. Gas prices rise by Q3"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        label="Total cost ($)"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="300.00"
        value={totalCost}
        onChange={(e) => setTotalCost(e.target.value)}
        required
      />
      {members.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2">
            Placed by
          </label>
          <select
            className="w-full rounded-lg border border-gray-600 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-900"
            value={placedBy}
            onChange={(e) => setPlacedBy(e.target.value)}
          >
            <option value="">— Select member —</option>
            {members.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">
          Participants
          {perPerson > 0 && (
            <span className="ml-2 font-normal text-gray-400 text-xs">
              ({count} people · ${perPerson.toFixed(2)}/each)
            </span>
          )}
        </p>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">Add members first on the Members tab.</p>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-indigo-600"
                  checked={participantIds.includes(m.id)}
                  onChange={() => toggleParticipant(m.id)}
                />
                <span className="text-sm text-gray-300">{m.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Input
        label="Notes (optional)"
        placeholder="Any additional details…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1">Date placed</label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
          value={placedAt}
          onChange={(e) => setPlacedAt(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving…' : 'Add Bet'}
        </Button>
      </div>
    </form>
  );
}
