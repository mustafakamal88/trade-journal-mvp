import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const trades = await prisma.trade.findMany({ where: { userId: user!.id }, orderBy: { openedAt: "desc" } });
  return NextResponse.json(trades);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { symbol, instrument = "STOCK", side, strategy, account, timeframe, quantity, entryPrice, exitPrice, stopLoss, takeProfit, fees = 0, openedAt, closedAt, tags = [], notes, rr } = body;
  const realizedPnl = typeof exitPrice === "number" ? (exitPrice - entryPrice) * (side === "LONG" ? 1 : -1) * quantity - (fees ?? 0) : 0;
  const win = realizedPnl >= 0;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const trade = await prisma.trade.create({ data: { userId: user!.id, symbol, instrument, side, strategy, account, timeframe, quantity, entryPrice, exitPrice, stopLoss, takeProfit, fees, openedAt: new Date(openedAt), closedAt: closedAt ? new Date(closedAt) : null, realizedPnl, win, tags, notes, rr } });
  return NextResponse.json(trade);
}
