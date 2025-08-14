"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Tooltip, message, Skeleton } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import clsx from "clsx";

dayjs.extend(isoWeek);

type DayAgg = {
  date: string;    // "YYYY-MM-DD"
  pnl: number;
  balance: number;
  win: boolean;
};

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DayAgg[]>([]);
  const [byDate, setByDate] = useState<Record<string, DayAgg>>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/calendar-aggregate", { cache: "no-store" });
        if (!r.ok) {
          message.error("Please sign in to view calendar.");
          setLoading(false);
          return;
        }
        const list: DayAgg[] = await r.json();
        const map: Record<string, DayAgg> = {};
        for (const d of list) map[d.date] = d;
        setByDate(map);
        setRows(list);
      } catch {
        message.error("Failed to load calendar.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dateCellRender = (value: Dayjs) => {
    const key = value.format("YYYY-MM-DD");
    const item = byDate[key];
    if (!item) return null;

    const isProfit = item.pnl > 0;
    const isLoss = item.pnl < 0;
    const pnlStr = money(item.pnl);
    const balStr = money(item.balance);

    return (
      <Tooltip title={`PnL: ${pnlStr} • Balance: ${balStr}`}>
        <div
          className={clsx(
            "rounded-lg px-2 py-1 text-[11px] leading-tight shadow-sm border",
            isProfit && "bg-emerald-50 text-emerald-800 border-emerald-100",
            isLoss && "bg-rose-50 text-rose-800 border-rose-100",
            !isProfit && !isLoss && "bg-gray-50 text-gray-700 border-gray-100"
          )}
        >
          <div className="font-semibold">{pnlStr}</div>
          <div className="opacity-70">Bal: {balStr}</div>
        </div>
      </Tooltip>
    );
  };

  const onSelect = (value: Dayjs) => {
    const d = value.format("YYYY-MM-DD");
    window.location.href = `/day/${d}`;
  };

  const weeks = useWeeklySummary(rows);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4">
      <div className="bg-white rounded-xl shadow p-2">
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Calendar
            fullscreen={false}
            dateCellRender={dateCellRender}
            onSelect={onSelect}
          />
        )}
      </div>

      <aside className="bg-white rounded-xl shadow p-3 h-fit md:sticky md:top-4">
        <h3 className="text-sm font-semibold mb-2">Weekly Summary</h3>
        <div className="space-y-2">
          {weeks.map((w) => (
            <div
              key={w.key}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div className="text-xs text-gray-500">Week {w.weekOfMonth}</div>
              <div className={w.pnl >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                {money(w.pnl)}
              </div>
              <div className="text-[11px] text-gray-500">
                {w.days} day{w.days === 1 ? "" : "s"}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ---------- helpers ---------- */

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const base =
    abs >= 1000 ? (abs / 1000).toFixed(2).replace(/\.00$/, "") + "K" : abs.toFixed(2);
  return `${sign}$${base}`;
}

function useWeeklySummary(rows: DayAgg[]) {
  return useMemo(() => {
    const byWeek = new Map<
      string,
      { key: string; weekStart: dayjs.Dayjs; pnl: number; days: number }
    >();

    for (const r of rows) {
      const d = dayjs(r.date);
      const wkStart = d.startOf("isoWeek"); // Monday-start week
      const key = wkStart.format("YYYY-[W]WW");
      const slot = byWeek.get(key) ?? { key, weekStart: wkStart, pnl: 0, days: 0 };
      slot.pnl += r.pnl;
      slot.days += 1;
      byWeek.set(key, slot);
    }

    const arr = [...byWeek.values()].sort(
      (a, b) => a.weekStart.valueOf() - b.weekStart.valueOf()
    );

    // simple "Week 1..6 of month" calculation
    return arr.map((w) => {
      const firstOfMonth = w.weekStart.startOf("month");
      const offsetDays = w.weekStart.diff(firstOfMonth, "day");
      const weekOfMonth = Math.floor(offsetDays / 7) + 1; // 1..6
      return {
        key: w.key,
        weekStart: w.weekStart,
        weekOfMonth,
        pnl: Number(w.pnl.toFixed(2)),
        days: w.days,
      };
    });
  }, [rows]);
}
