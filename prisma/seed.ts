import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { seedUsers } from './seeds/users';
import { seedDocuments } from './seeds/documents';
import { seedRequests } from './seeds/requests';

const getSeedConnectionString = () => {
  const fallback = 'postgres://postgres:password@localhost:5432/brgynexus';
  const rawConnectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || fallback;

  try {
    const url = new URL(rawConnectionString);
    const isSupabaseHost =
      url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.pooler.supabase.com');

    if (isSupabaseHost) {
      url.searchParams.delete('sslmode');
      url.searchParams.set('ssl', 'no-verify');
    }

    return {
      connectionString: url.toString(),
      ssl: isSupabaseHost ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    return {
      connectionString: rawConnectionString,
      ssl: undefined,
    };
  }
};

const { connectionString, ssl } = getSeedConnectionString();
const adapter = new PrismaPg({ connectionString, ssl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // 1. Clear dependent tables first to avoid foreign key constraints
  await prisma.requestStatusLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.document.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Execute seeds in order of dependency
  const users = await seedUsers(prisma);
  const documents = await seedDocuments(prisma);
  await seedRequests(prisma, users, documents);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
