import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const trades = await prisma.trade.findMany({
    where: { userId: user!.id, closedAt: { not: null } },
    select: { realizedPnl: true, closedAt: true }
  });

  // Aggregate P&L per day (YYYY-MM-DD)
  const byDay = new Map<string, number>();
  for (const t of trades) {
    const d = (t.closedAt as Date).toISOString().slice(0, 10);
    byDay.set(d, (byDay.get(d) ?? 0) + Number(t.realizedPnl ?? 0));
  }

  // Build a sorted array of days
  const days = Array.from(byDay.entries())
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  // Running balance
  const startBalance = Number(process.env.START_BALANCE ?? 10000);
  let balance = startBalance;
  const result = days.map((d) => {
    balance += d.pnl;
    return {
      date: d.date,
      pnl: d.pnl,
      balance,          // <— running balance up to this date
      win: d.pnl >= 0
    };
  });

  return NextResponse.json(result);
}
