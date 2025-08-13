import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = url.searchParams.get("date");
  if (!day) return NextResponse.json([]);
  const key = process.env.FMP_API_KEY;
  if (!key) return NextResponse.json([]);
  const r = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?from=${day}&to=${day}&apikey=${key}`);
  if (!r.ok) return NextResponse.json([]);
  const raw = await r.json();
  const items = (raw ?? []).slice(0, 20).map((a: any) => ({ title: a.title, url: a.url, source: a.site }));
  return NextResponse.json(items);
}
