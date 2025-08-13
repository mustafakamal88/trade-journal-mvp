import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const email = process.env.SEED_EMAIL || "you@example.com";
  const password = process.env.SEED_PASSWORD || "test123";
  const name = process.env.SEED_NAME || "Test User";
  const hash = bcrypt.hashSync(password, 10);
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name, passwordHash: hash } });
  console.log("Seeded:", { email, password, id: user.id });
}
main().finally(()=>prisma.$disconnect());
