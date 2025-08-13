import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) return NextResponse.json({ error: "missing date" }, { status: 400 });
  const form = await req.formData();
  const notes = String(form.get("notes") ?? "");
  const day = new Date(dateStr);
  const start = new Date(day); start.setHours(0,0,0,0);
  const end = new Date(day); end.setHours(23,59,59,999);
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });
  const existing = await prisma.journalEntry.findFirst({ where: { userId: user.id, date: { gte: start, lte: end } } });
  const saved = existing ? await prisma.journalEntry.update({ where: { id: existing.id }, data: { notes } }) : await prisma.journalEntry.create({ data: { userId: user.id, date: start, notes } });
  return NextResponse.json(saved);
}
