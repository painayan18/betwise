'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, CheckCircle } from 'lucide-react';
import type { Bet } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/Button';

interface BetCardProps {
  bet: Bet;
  onSettle: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function BetCard({ bet, onSettle, onDelete }: BetCardProps) {
  const [expanded, setExpanded] = useState(false);

  const count = bet.participants.length;
  const perPerson = count > 0 ? bet.total_cost / count : bet.total_cost;
  const perPersonWin = count > 0 && bet.total_winnings > 0 ? bet.total_winnings / count : 0;
  const netPerPerson = perPersonWin - perPerson;

  return (
    <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
      <button
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-100 truncate">{bet.description}</p>
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
          </div>
          {bet.status === 'won' && netPerPerson !== 0 && (
            <p className={`text-xs font-medium mt-1 ${netPerPerson >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              Net: {netPerPerson >= 0 ? '+' : ''}{fmt(netPerPerson)}/person
            </p>
          )}
          {bet.status === 'lost' && (
            <p className="text-xs font-medium mt-1 text-red-500">
              Net: -{fmt(perPerson)}/person
            </p>
          )}
        </div>
        <span className="text-gray-500 shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 px-4 py-3 space-y-3">
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
            <Button variant="danger" size="sm" onClick={() => onDelete(bet)}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
