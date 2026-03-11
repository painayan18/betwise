'use client';

import { useState, FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddMemberFormProps {
  onSuccess: () => void;
}

export function AddMemberForm({ onSuccess }: AddMemberFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Name is required'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to add member');
        return;
      }
      setName('');
      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          label="Add member"
          placeholder="Enter name…"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
        />
      </div>
      <Button type="submit" disabled={loading} className="shrink-0">
        <UserPlus size={16} />
        {loading ? '…' : 'Add'}
      </Button>
    </form>
  );
}
