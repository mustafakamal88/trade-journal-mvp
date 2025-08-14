import { Card, Statistic, Button } from 'antd';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// Helper functions (same as before)
function num(t: any, keys: string[]) {
  for (const k of keys) {
    const v = t?.[k];
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) return Number(v);
  }
  return NaN;
}
function dt(t: any, keys: string[]) {
  for (const k of keys) {
    const v = t?.[k];
    if (v) return new Date(v);
  }
  return null;
}
function isToday(d: Date | null) {
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
function realizedPnl(t: any) {
  const side = (t?.side ?? '').toString().toUpperCase();
  const entry = num(t, ['entry', 'entryPrice', 'avgEntry']);
  const exit = num(t, ['exitPrice', 'closePrice', 'avgExit']);
  const size = num(t, ['size', 'quantity']);
  const fees = num(t, ['fees', 'commission']);
  if ([entry, exit, size].some((x) => Number.isNaN(x))) return 0;
  const gross = side === 'SHORT' ? (entry - exit) * size : (exit - entry) * size;
  return gross - (Number.isNaN(fees) ? 0 : fees);
}
function rrRatio(t: any): number | null {
  const entry = num(t, ['entry', 'entryPrice']);
  const exit = num(t, ['exitPrice', 'closePrice']);
  const sl = num(t, ['stopLoss', 'sl']);
  if ([entry, exit, sl].some((x) => Number.isNaN(x))) return null;
  const risk = Math.abs(entry - sl);
  if (risk === 0) return null;
  const reward = Math.abs(exit - entry);
  return reward / risk;
}

async function getTodayStats() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error('Error getting session:', err);
    return { pnl: 0, trades: 0, rr: 0 };
  }

  if (!session?.user?.email) return { pnl: 0, trades: 0, rr: 0 };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { pnl: 0, trades: 0, rr: 0 };

  const trades = (await prisma.trade.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  })) as any[];

  const closedToday = trades.filter((t) =>
    isToday(dt(t, ['exitAt', 'closedAt', 'updatedAt']))
  );

  const pnl = closedToday.reduce((acc, t) => acc + realizedPnl(t), 0);
  const rrs = closedToday.map(rrRatio).filter((v): v is number => v !== null && isFinite(v));
  const rrAvg = rrs.length ? Number((rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2)) : 0;

  return { pnl, trades: closedToday.length, rr: rrAvg };
}


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

      <Card className="shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Today at a glance</h2>
        <div className="grid grid-cols-3 gap-4">
          <Statistic title="P&L" value={stats.pnl} precision={2} prefix={stats.pnl >= 0 ? '+' : ''} />
          <Statistic title="Trades" value={stats.trades} />
          <Statistic title="R/R" value={stats.rr} precision={2} />
        </div>
      </Card>

      <footer className="mt-16 text-gray-500 text-sm">
        © {new Date().getFullYear()} Trade Journal
      </footer>
    </main>
  );
}
