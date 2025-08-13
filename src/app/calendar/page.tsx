"use client";

import { useEffect, useState } from "react";
import { Calendar, Badge, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

type DayAgg = { date: string; pnl: number; win: boolean; balance: number };

export default function CalendarPage() {
  const [days, setDays] = useState<Record<string, DayAgg>>({});

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/calendar-aggregate");
      if (!r.ok) {
        message.error("Please sign in to view calendar.");
        return;
      }
      const list: DayAgg[] = await r.json();
      const map: Record<string, DayAgg> = {};
      for (const d of list) map[d.date] = d;
      setDays(map);
    })();
  }, []);

  const dateCellRender = (value: Dayjs) => {
    const key = value.format("YYYY-MM-DD");
    const item = days[key];
    if (!item) return null;
    // Show Balance instead of daily P&L
    const label = `Bal: ${formatMoney(item.balance)}`;
    // Keep color hint from daily P&L for quick glance
    const status = item.win ? "success" : "error";
    return <Badge status={status as any} text={label} />;
  };

  const onSelect = (value: Dayjs) => {
    const d = value.format("YYYY-MM-DD");
    window.location.href = `/day/${d}`;
  };

  return <Calendar dateCellRender={dateCellRender} onSelect={onSelect} />;
}

function formatMoney(n: number) {
  // simple USD-style formatting without locale dependency
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n).toFixed(0);
  return `${sign}$${v}`;
}
