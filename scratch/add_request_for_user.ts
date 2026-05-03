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

  const doc = await prisma.document.findFirst({
    where: { name: 'Barangay Clearance' }
  });

  if (!doc) {
    console.log('Barangay Clearance document type not found.');
    return;
  }

  console.log(`Creating APPROVED request for John Earl Balabat...`);

  const request = await prisma.documentRequest.create({
    data: {
      residentId: user.residentProfile.id,
      documentId: doc.id,
      purpose: 'Testing Resend Email Integration',
      status: 'APPROVED',
    }
  });

  console.log('✓ APPROVED request created successfully!');
  console.log('Request ID:', request.id);
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
