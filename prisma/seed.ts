import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/brgynexus';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brgynexus.com' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@brgynexus.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Create Staff
  const staff = await prisma.user.upsert({
    where: { email: 'staff@brgynexus.com' },
    update: {},
    create: {
      firstName: 'Barangay',
      lastName: 'Staff',
      email: 'staff@brgynexus.com',
      passwordHash,
      role: 'STAFF',
    },
  });

  // Seed Documents
  await prisma.document.deleteMany(); // Reset documents to avoid duplicates
  await prisma.document.createMany({
    data: [
      { name: 'Barangay Clearance', description: 'For employment, business, or general purposes.', fee: 50, processingDays: 1 },
      { name: 'Certificate of Indigency', description: 'For financial assistance, scholarship, or medical aid.', fee: 0, processingDays: 1 },
      { name: 'Business Permit Clearance', description: 'Required for new business registration or renewal.', fee: 150, processingDays: 3 },
      { name: 'Certificate of Residency', description: 'Proof of residency within the barangay.', fee: 30, processingDays: 1 },
    ],
  });

  console.log('Seeded database with Admin, Staff, and Documents!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
