import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/brgynexus';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "johnearl.balabat@gmail.com";
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { residentProfile: true }
  });

  if (!user || !user.residentProfile) {
    console.log(`Resident profile not found for ${email}.`);
    return;
  }

  const docs = await prisma.document.findMany({
    take: 3
  });

  console.log(`Creating 3 more APPROVED requests for John Earl Balabat...`);

  const requests = docs.map((doc, i) => ({
    residentId: user.residentProfile!.id,
    documentId: doc.id,
    purpose: `Batch Test Request ${i + 1}`,
    status: 'APPROVED',
  }));

  const result = await prisma.documentRequest.createMany({
    data: requests as any,
  });

  console.log(`✓ Created ${result.count} more APPROVED requests.`);
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
