'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, BarChart2, Users } from 'lucide-react';

const tabs = [
  { href: '/bets', label: 'Bets', icon: Ticket },
  { href: '/balances', label: 'Profits', icon: BarChart2 },
  { href: '/members', label: 'Members', icon: Users },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 sm:static sm:border-t-0 sm:border-b sm:border-gray-700">
      <div className="max-w-4xl mx-auto flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 hidden sm:block" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
