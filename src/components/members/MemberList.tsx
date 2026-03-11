'use client';

import { useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import type { Member } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface MemberListProps {
  members: Member[];
  onDelete: (id: number) => void;
}

export function MemberList({ members, onDelete }: MemberListProps) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users />}
        title="No members yet"
        description="Add members above to start splitting bets."
      />
    );
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {m.name[0].toUpperCase()}
          </div>
          <span className="flex-1 font-medium text-gray-800">{m.name}</span>
          {confirmId === m.id ? (
            <div className="flex gap-1.5">
              <Button variant="danger" size="sm" onClick={() => { onDelete(m.id); setConfirmId(null); }}>
                Confirm
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(m.id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
              aria-label={`Remove ${m.name}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
