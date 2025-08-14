import { Button } from 'antd';
import Link from 'next/link';
import TodayStatsCard from './components/TodayStatsCard';
import { getTodayStats } from '@/lib/stats';

export default async function Home() {
  const stats = await getTodayStats();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <section className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Journal your trades. <span className="text-blue-600">Stay consistent.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Log trades, see daily P&amp;L on a calendar, and keep notes with news and screenshots.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/trades"><Button type="primary" size="large">Get Started</Button></Link>
          <Link href="/calendar"><Button size="large">View Calendar</Button></Link>
        </div>
      </section>

      <TodayStatsCard initial={stats} />

      <footer className="mt-16 text-gray-500 text-sm">
        © {new Date().getFullYear()} Trade Journal
      </footer>
    </main>
  );
}
