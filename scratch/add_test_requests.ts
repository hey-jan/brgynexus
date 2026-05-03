import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/brgynexus';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const residents = await prisma.residentProfile.findMany();
  const docs = await prisma.document.findMany();

  if (residents.length === 0 || docs.length === 0) {
    console.log('No residents or documents found. Please run npm run seed first.');
    return;
  }

  console.log('Creating 5 fresh APPROVED requests for testing...');

  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push({
      residentId: residents[i % residents.length].id,
      documentId: docs[i % docs.length].id,
      purpose: `Test Request ${i + 1} for Watermark Validation`,
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const result = await prisma.documentRequest.createMany({
    data: requests as any,
  });

  console.log(`Successfully created ${result.count} APPROVED requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
