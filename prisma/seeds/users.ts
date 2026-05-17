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

  // Resident 3
  const resident3 = await prisma.user.upsert({
    where: { email: 'pedro@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Pedro', 
      lastName: 'Penduko', 
      email: 'pedro@brgynexus.com', 
      passwordHash, 
      phone: '09111111111', 
      role: 'RESIDENT' 
    },
  });

  const profile3 = await prisma.residentProfile.upsert({
    where: { userId: resident3.id },
    update: {},
    create: { 
      userId: resident3.id, 
      address: '789 Mabini St.', 
      gender: 'MALE', 
      civilStatus: 'SINGLE', 
      birthdate: new Date('1995-08-20') 
    },
  });

  // Resident 4
  const resident4 = await prisma.user.upsert({
    where: { email: 'ana@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Ana', 
      lastName: 'Reyes', 
      email: 'ana@brgynexus.com', 
      passwordHash, 
      phone: '09222222222', 
      role: 'RESIDENT' 
    },
  });

  const profile4 = await prisma.residentProfile.upsert({
    where: { userId: resident4.id },
    update: {},
    create: { 
      userId: resident4.id, 
      address: '321 Rizal Ave.', 
      gender: 'FEMALE', 
      civilStatus: 'WIDOWED', 
      birthdate: new Date('1970-12-10') 
    },
  });

  // Resident 5
  const resident5 = await prisma.user.upsert({
    where: { email: 'carlos@brgynexus.com' },
    update: {},
    create: { 
      firstName: 'Carlos', 
      lastName: 'Dalisay', 
      email: 'carlos@brgynexus.com', 
      passwordHash, 
      phone: '09333333333', 
      role: 'RESIDENT' 
    },
  });

  const profile5 = await prisma.residentProfile.upsert({
    where: { userId: resident5.id },
    update: {},
    create: { 
      userId: resident5.id, 
      address: '654 Bonifacio St.', 
      gender: 'MALE', 
      civilStatus: 'MARRIED', 
      birthdate: new Date('1988-03-25') 
    },
  });

  console.log('✓ Seeded Users & Profiles');
  return { 
    admin, 
    staff, 
    residents: [profile1, profile2, johnEarlProfile, profile3, profile4, profile5] 
  };
}
