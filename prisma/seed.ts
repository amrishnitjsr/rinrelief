import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "NyayaShield Admin";
  const phone = process.env.ADMIN_PHONE?.trim() || "+910000000000";
  if (!email || !password || password.length < 8) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters) before running the seed.");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, phone, passwordHash, role: Role.SUPER_ADMIN },
    create: { name, email, phone, passwordHash, role: Role.SUPER_ADMIN },
  });
  console.log(`Admin account ready: ${user.email}`);
  await prisma.feedback.deleteMany({ where: { isDemo: true } });
  await prisma.feedback.createMany({
    data: [
      { name: "Ananya Mehta", city: "Pune", rating: 5, message: "The team helped me understand my options and respond calmly to recovery calls.", approved: true, isDemo: true },
      { name: "Rahul Verma", city: "Jaipur", rating: 5, message: "Clear communication and a practical plan made a difficult situation feel manageable.", approved: true, isDemo: true },
      { name: "Priya Nair", city: "Bengaluru", rating: 4, message: "I appreciated the structured guidance and regular updates throughout my consultation.", approved: true, isDemo: true },
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
