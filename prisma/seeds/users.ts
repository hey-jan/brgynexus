import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: any) {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Super', 
      lastName: 'Admin', 
      email: 'admin@brgynexus.com', 
      passwordHash, 
      phone: '09001234567',
      role: 'ADMIN' 
    },
  });

  // Staff
  const staff = await prisma.user.upsert({
    where: { email: 'staff@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Barangay', 
      lastName: 'Staff', 
      email: 'staff@brgynexus.com', 
      passwordHash, 
      phone: '09009876543',
      role: 'STAFF' 
    },
  });

  // Resident 1
  const resident1 = await prisma.user.upsert({
    where: { email: 'juan@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Juan', 
      lastName: 'Dela Cruz', 
      email: 'juan@brgynexus.com', 
      passwordHash, 
      phone: '09123456789', 
      role: 'RESIDENT' 
    },
  });

  const profile1 = await prisma.residentProfile.upsert({
    where: { userId: resident1.id },
    update: {},
    create: { 
      userId: resident1.id, 
      address: '123 Sampaguita St.', 
      gender: 'MALE', 
      civilStatus: 'SINGLE', 
      birthdate: new Date('1990-01-01') 
    },
  });

  // Resident 2 (Maria)
  const resident2 = await prisma.user.upsert({
    where: { email: 'maria@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Maria', 
      lastName: 'Santos', 
      email: 'maria@brgynexus.com', 
      passwordHash, 
      phone: '09987654321', 
      role: 'RESIDENT' 
    },
  });

  const profile2 = await prisma.residentProfile.upsert({
    where: { userId: resident2.id },
    update: {},
    create: { 
      userId: resident2.id, 
      address: '456 Narra St.', 
      gender: 'FEMALE', 
      civilStatus: 'MARRIED', 
      birthdate: new Date('1985-05-15') 
    },
  });

  // John Earl Balabat (Personal Test Profile)
  const johnEarl = await prisma.user.upsert({
    where: { email: 'johnearl.balabat@gmail.com' },
    update: {},
    create: { 
      firstName: 'John Earl', 
      lastName: 'Balabat', 
      email: 'johnearl.balabat@gmail.com', 
      passwordHash, 
      role: 'RESIDENT' 
    },
  });

  const johnEarlProfile = await prisma.residentProfile.upsert({
    where: { userId: johnEarl.id },
    update: {},
    create: { 
      userId: johnEarl.id, 
      address: 'Brgy. Nexus, City of Manila', 
      gender: 'MALE', 
      civilStatus: 'SINGLE', 
      birthdate: new Date('1990-01-01'),
      isVerified: true
    },
  });

  console.log('✓ Seeded Users & Profiles');
  return { 
    admin, 
    staff, 
    residents: [profile1, profile2, johnEarlProfile] 
  };
}
