'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, CheckCircle, Pencil, Check, X } from 'lucide-react';
import type { Bet, Member } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/Button';

interface BetCardProps {
  bet: Bet;
  members: Member[];
  onSettle: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
  onUpdate: () => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function BetCard({ bet, members, onSettle, onDelete, onUpdate }: BetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(bet.description);
  const [totalCost, setTotalCost] = useState(String(bet.total_cost));
  const [placedBy, setPlacedBy] = useState(bet.placed_by ?? '');
  const [participantIds, setParticipantIds] = useState<number[]>(bet.participants.map((p) => p.id));
  const [notes, setNotes] = useState(bet.notes ?? '');
  const [placedAt, setPlacedAt] = useState(bet.placed_at ?? '');
  // For settled bets: won → total_winnings; lost → amount_lost (total_cost - total_winnings)
  const [totalWinnings, setTotalWinnings] = useState(bet.status === 'won' ? String(bet.total_winnings) : '');
  const [amountLost, setAmountLost] = useState(bet.status === 'lost' ? String(bet.total_cost - bet.total_winnings) : '');
  const [saving, setSaving] = useState(false);

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const count = bet.participants.length;
  const perPerson = count > 0 ? bet.total_cost / count : bet.total_cost;
  const perPersonWin = count > 0 && bet.total_winnings > 0 ? bet.total_winnings / count : 0;
  const netPerPerson = perPersonWin - perPerson;

  function toggleParticipant(id: number) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (!description.trim()) return;
    if (!totalCost || Number(totalCost) <= 0) return;
    if (participantIds.length === 0) return;
    setSaving(true);
    const cost = Number(totalCost);
    const settled_winnings = bet.status === 'won'
      ? (totalWinnings ? Number(totalWinnings) : undefined)
      : bet.status === 'lost'
        ? (amountLost ? cost - Number(amountLost) : undefined)
        : undefined;
    await fetch(`/api/bets/${bet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description.trim(),
        total_cost: cost,
        placed_by: placedBy || null,
        notes: notes.trim() || null,
        placed_at: placedAt || null,
        ...(settled_winnings !== undefined && { total_winnings: settled_winnings }),
      }),
    });
    await fetch(`/api/bets/${bet.id}/participants`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_ids: participantIds }),
    });
    setSaving(false);
    setEditing(false);
    onUpdate();
  }

  function handleCancel() {
    setDescription(bet.description);
    setTotalCost(String(bet.total_cost));
    setPlacedBy(bet.placed_by ?? '');
    setParticipantIds(bet.participants.map((p) => p.id));
    setNotes(bet.notes ?? '');
    setPlacedAt(bet.placed_at ?? '');
    setTotalWinnings(bet.status === 'won' ? String(bet.total_winnings) : '');
    setAmountLost(bet.status === 'lost' ? String(bet.total_cost - bet.total_winnings) : '');
    setEditing(false);
  }

  const editCount = participantIds.length;
  const editPerPerson = editCount > 0 && Number(totalCost) > 0 ? Number(totalCost) / editCount : 0;

  return (
    <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
      <button
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-100">
              {bet.description}
              {bet.placed_at && (
                <span className="font-normal text-gray-400 text-sm ml-1">— placed on {formatDate(bet.placed_at)}</span>
              )}
            </p>
            <StatusBadge status={bet.status} />
          </div>
          {bet.placed_by && (
            <p className="text-xs text-gray-400 mt-0.5">Placed by {bet.placed_by}</p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
            <span className="text-gray-300">
              Cost: <strong>{fmt(bet.total_cost)}</strong>
              {count > 0 && <span className="text-gray-400"> ({fmt(perPerson)}/person)</span>}
            </span>
            {bet.status === 'won' && bet.total_winnings > 0 && (
              <span className="text-green-600">
                Won: <strong>{fmt(bet.total_winnings)}</strong>
                {count > 0 && <span> ({fmt(perPersonWin)}/person)</span>}
              </span>
            )}
            {bet.status === 'lost' && bet.total_winnings > 0 && (
              <span className="text-gray-400">
                Returned: <strong>{fmt(bet.total_winnings)}</strong>
                {count > 0 && <span> ({fmt(perPersonWin)}/person)</span>}
              </span>
            )}
          </div>
          {(bet.status === 'won' || bet.status === 'lost') && (
            <p className={`text-xs font-medium mt-1 ${netPerPerson >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              Net: {netPerPerson >= 0 ? '+' : ''}{fmt(netPerPerson)}/person
            </p>
          )}
        </div>
        <span className="text-gray-500 shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 px-4 py-3 space-y-3">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Gas prices rise by Q3"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Total cost ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {bet.status === 'won' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Total winnings ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                    value={totalWinnings}
                    onChange={(e) => setTotalWinnings(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
              {bet.status === 'lost' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Amount lost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                    value={amountLost}
                    onChange={(e) => setAmountLost(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
              {members.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Placed by</label>
                  <select
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                    value={placedBy}
                    onChange={(e) => setPlacedBy(e.target.value)}
                  >
                    <option value="">— optional —</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1.5">
                  Participants
                  {editPerPerson > 0 && (
                    <span className="ml-2 font-normal text-gray-500">
                      ({editCount} · {fmt(editPerPerson)}/each)
                    </span>
                  )}
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
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
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Notes (optional)</label>
                <input
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Date placed</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-400"
                  value={placedAt}
                  onChange={(e) => setPlacedAt(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={handleSave} disabled={saving || !description.trim() || participantIds.length === 0}>
                  <Check size={14} /> {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCancel}>
                  <X size={14} /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {bet.participants.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1.5">Participants ({count})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bet.participants.map((p) => (
                      <span key={p.id} className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {bet.notes && (
                <p className="text-sm text-gray-400 italic">{bet.notes}</p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(bet.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <div className="flex gap-2 pt-1">
                {bet.status === 'pending' && (
                  <Button variant="primary" size="sm" onClick={() => onSettle(bet)}>
                    <CheckCircle size={14} /> Settle
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => { setExpanded(true); setEditing(true); }}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(bet)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
