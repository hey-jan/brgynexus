import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/brgynexus';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "johnearl.balabat@gmail.com";
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    return;
  }

  console.log(`Creating user: John Earl Balabat (${email})...`);

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      firstName: 'John Earl',
      lastName: 'Balabat',
      email: email,
      passwordHash: passwordHash,
      role: 'RESIDENT',
      residentProfile: {
        create: {
          gender: 'MALE',
          address: 'Brgy. Nexus, City of Manila',
          birthdate: new Date('1990-01-01'),
          civilStatus: 'SINGLE',
          isVerified: true
        }
      }
    },
    include: {
      residentProfile: true
    }
  });

  console.log('✓ User and Resident Profile created successfully!');
  console.log('User ID:', user.id);
  console.log('Resident Profile ID:', user.residentProfile?.id);
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
