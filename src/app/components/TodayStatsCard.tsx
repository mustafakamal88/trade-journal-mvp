// components/TodayStatsCard.tsx
'use client';
import useSWR from 'swr';
import { Card, Statistic } from 'antd';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TodayStatsCard() {
  const { data = { pnl: 0, trades: 0, rr: 0 } } = useSWR('/api/stats/today', fetcher, {
    refreshInterval: 15000,
  });

  return (
    <Card className="shadow-md rounded-lg w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">Today at a glance</h2>
      <div className="grid grid-cols-3 gap-4">
        <Statistic title="P&L" value={data.pnl} precision={2} prefix={data.pnl >= 0 ? '+' : ''} />
        <Statistic title="Trades" value={data.trades} />
        <Statistic title="R/R" value={data.rr} precision={2} />
      </div>
    </Card>
  );
}
