"use client";

import { useEffect, useState } from "react";
import { Card, List, Typography, message } from "antd";

export default function DayPage({ params }: { params: { date: string } }) {
  const dayStr = params.date;
  const [trades, setTrades] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // get all trades, filter client-side for the chosen date
        const tr = await fetch("/api/trades");
        if (tr.status === 401) {
          window.location.href = "/signin";
          return;
        }
        const tjson = await tr.json();
        const dayStart = new Date(`${dayStr}T00:00:00.000Z`);
        const dayEnd = new Date(`${dayStr}T23:59:59.999Z`);
        const sameDay = (d: string) => {
          const x = new Date(d).getTime();
          return x >= dayStart.getTime() && x <= dayEnd.getTime();
        };
        const dayTrades = tjson.filter((t: any) => t.openedAt && sameDay(t.openedAt));

        // fetch notes/news
        const nres = await fetch(`/api/news?date=${dayStr}`, { cache: "no-store" });
        const njson = nres.ok ? await nres.json() : [];

        setTrades(dayTrades);
        setNews(njson);
      } catch (e) {
        message.error("Failed to load day data");
      } finally {
        setLoading(false);
      }
    })();
  }, [dayStr]);

  const pnl = trades.reduce((s, t) => s + Number(t.realizedPnl ?? 0), 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card loading={loading} title={`${dayStr} — P&L`} extra={<span className={pnl>=0? "text-emerald-600":"text-red-600"}>{pnl.toFixed(2)}</span>}>
        <List
          header="Trades"
          dataSource={trades}
          renderItem={(t) => (
            <List.Item
              actions={[
                <span key="pnl" className={Number(t.realizedPnl)>=0? "text-emerald-600":"text-red-600"}>
                  {Number(t.realizedPnl).toFixed(2)}
                </span>,
              ]}
            >
              <List.Item.Meta
                title={`${t.symbol} · ${t.side} · ${Number(t.quantity)} @ ${Number(t.entryPrice)}`}
                description={t.notes || ""}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Notes">
        <form action={`/api/journal?date=${dayStr}`} method="post">
          <textarea
            name="notes"
            rows={6}
            defaultValue={notes}
            className="w-full rounded border p-2"
          />
          <button className="mt-2 rounded border px-3 py-1">Save</button>
        </form>
      </Card>

      <Card title="News">
        <ul className="space-y-2">
          {news.map((n: any, i: number) => (
            <li key={i}>
              <a href={n.url} target="_blank" rel="noreferrer" className="underline">
                {n.title}
              </a>{" "}
              <span className="text-xs text-gray-500">({n.source})</span>
            </li>
          ))}
          {!news.length && <Typography.Text type="secondary">No articles found for this date.</Typography.Text>}
        </ul>
      </Card>
    </div>
  );
}
