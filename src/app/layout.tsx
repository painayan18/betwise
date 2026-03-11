import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { TabNav } from '@/components/layout/TabNav';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BetWise',
  description: 'Group betting expense splitter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-[#0f0f11] text-gray-100`}>
        <div className="max-w-lg mx-auto min-h-screen flex flex-col">
          <TabNav />
          <main className="flex-1 px-4 pt-4 pb-24 sm:pb-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
