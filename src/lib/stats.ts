import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getTodayStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { pnl: 0, trades: 0, rr: 0 };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { pnl: 0, trades: 0, rr: 0 };

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const { _sum, _avg, _count } = await prisma.trade.aggregate({
    where: {
      userId: user.id,
      closedAt: {
        gte: start,
        lt: end,
      },
    },
    _sum: { realizedPnl: true },
    _avg: { rr: true },
    _count: { _all: true },
  });

  return {
    pnl: Number(_sum.realizedPnl ?? 0),
    trades: _count._all,
    rr: _avg.rr ? Number(_avg.rr) : 0,
  };
}
