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
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "missing file" }, { status: 400 });

  // Ask for presigned URL
  const r = await fetch(`${process.env.NEXTAUTH_URL ?? ""}/api/upload/presign?contentType=${encodeURIComponent(file.type)}`);
  if (!r.ok) return NextResponse.json({ error: "S3 not configured" }, { status: 400 });
  const { url, publicUrl } = await r.json();

  // Upload to S3
  await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });

  // Ensure a journal entry for that date
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const start = new Date(dateStr + "T00:00:00.000Z");
  const end = new Date(dateStr + "T23:59:59.999Z");
  let entry = await prisma.journalEntry.findFirst({ where: { userId: user!.id, date: { gte: start, lte: end } } });
  if (!entry) entry = await prisma.journalEntry.create({ data: { userId: user!.id, date: start, notes: "" } });

  await prisma.attachment.create({ data: { entryId: entry.id, url: publicUrl, mimeType: file.type } });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL ?? ""}/day/${dateStr}`, 302);
}
