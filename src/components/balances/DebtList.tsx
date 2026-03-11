import type { DebtEntry } from '@/lib/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function DebtList({ debts }: { debts: DebtEntry[] }) {
  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 gap-2 text-gray-400">
        <CheckCircle2 size={32} className="text-green-400" />
        <p className="text-sm font-medium">All settled up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {debts.map((debt, i) => (
        <div key={i} className="bg-gray-900 rounded-xl border border-gray-700 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
              <span>{debt.from.name}</span>
              <ArrowRight size={14} className="text-gray-500 shrink-0" />
              <span>{debt.to.name}</span>
            </div>
          </div>
          <span className="text-base font-bold text-gray-100">{fmt(debt.amount)}</span>
        </div>
      ))}
    </div>
  );
}
