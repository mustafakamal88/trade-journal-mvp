// lib/pnl.ts
import { Prisma } from '@prisma/client';

export type TradeDTO = {
  side: 'LONG' | 'SHORT';
  entry: Prisma.Decimal;
  exitPrice: Prisma.Decimal | null;
  size: Prisma.Decimal;
  fees: Prisma.Decimal | null;
  stopLoss: Prisma.Decimal | null;
};

export function realizedPnl(t: TradeDTO): number {
  if (!t.exitPrice) return 0;
  const entry = Number(t.entry);
  const exit = Number(t.exitPrice);
  const size = Number(t.size);
  const fees = Number(t.fees ?? 0);
  const gross =
    t.side === 'LONG' ? (exit - entry) * size : (entry - exit) * size;
  return gross - fees;
}

export function rrRatio(t: TradeDTO): number | null {
  if (!t.exitPrice || !t.stopLoss) return null;
  const entry = Number(t.entry);
  const exit = Number(t.exitPrice);
  const sl = Number(t.stopLoss);
  const risk = Math.abs(entry - sl);
  if (risk === 0) return null;
  const reward = Math.abs(exit - entry);
  return reward / risk;
}
