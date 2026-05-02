import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: any) {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brgynexus.com' },
    update: {},
    create: { firstName: 'Super', lastName: 'Admin', email: 'admin@brgynexus.com', passwordHash, role: 'ADMIN' },
  });

  // Staff
  const staff = await prisma.user.upsert({
    where: { email: 'staff@brgynexus.com' },
    update: {},
    create: { firstName: 'Barangay', lastName: 'Staff', email: 'staff@brgynexus.com', passwordHash, role: 'STAFF' },
  });

  // Resident 1
  const resident1 = await prisma.user.upsert({
    where: { email: 'juan@brgynexus.com' },
    update: {},
    create: { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@brgynexus.com', passwordHash, phone: '09123456789', role: 'RESIDENT' },
  });

  const profile1 = await prisma.residentProfile.upsert({
    where: { userId: resident1.id },
    update: {},
    create: { userId: resident1.id, address: '123 Sampaguita St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1990-01-01') },
  });

  // Resident 2
  const resident2 = await prisma.user.upsert({
    where: { email: 'maria@brgynexus.com' },
    update: {},
    create: { firstName: 'Maria', lastName: 'Santos', email: 'maria@brgynexus.com', passwordHash, phone: '09987654321', role: 'RESIDENT' },
  });

  const profile2 = await prisma.residentProfile.upsert({
    where: { userId: resident2.id },
    update: {},
    create: { userId: resident2.id, address: '456 Narra St.', gender: 'FEMALE', civilStatus: 'MARRIED', birthdate: new Date('1985-05-15') },
  });

  console.log('✓ Seeded Users & Profiles');
  return { admin, staff, residents: [profile1, profile2] };
}
