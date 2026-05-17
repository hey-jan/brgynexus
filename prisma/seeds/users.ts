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
      birthdate: new Date('1990-01-01'),
      isVerified: true,
      residentType: 'PERMANENT'
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
      birthdate: new Date('1985-05-15'),
      isVerified: true,
      residentType: 'PERMANENT'
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
      isVerified: true,
      residentType: 'PERMANENT'
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
      birthdate: new Date('1995-08-20'),
      isVerified: true,
      residentType: 'PERMANENT'
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
      birthdate: new Date('1970-12-10'),
      isVerified: true,
      residentType: 'PERMANENT'
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
      birthdate: new Date('1988-03-25'),
      isVerified: true,
      residentType: 'PERMANENT'
    },
  });

  // Additional 24 residents to reach exactly 30 registered residents
  const additionalResidents = [
    { firstName: 'Angelo', lastName: 'Macaraeg', email: 'angelo@brgynexus.com', phone: '09444444444', address: '111 Sampaguita St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1994-04-12') },
    { firstName: 'Bianca', lastName: 'Perez', email: 'bianca@brgynexus.com', phone: '09555555555', address: '222 Narra St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1996-07-22') },
    { firstName: 'Christian', lastName: 'Bautista', email: 'christian@brgynexus.com', phone: '09666666666', address: '333 Rizal Ave.', gender: 'MALE', civilStatus: 'MARRIED', birthdate: new Date('1983-10-18') },
    { firstName: 'Diana', lastName: 'Lim', email: 'diana@brgynexus.com', phone: '09777777777', address: '444 Bonifacio St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1991-02-28') },
    { firstName: 'Eric', lastName: 'Santos', email: 'eric@brgynexus.com', phone: '09888888888', address: '555 Mabini St.', gender: 'MALE', civilStatus: 'MARRIED', birthdate: new Date('1987-12-05') },
    { firstName: 'Fiona', lastName: 'Cruz', email: 'fiona@brgynexus.com', phone: '09999999999', address: '666 Sampaguita St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1998-05-14') },
    { firstName: 'Gabriel', lastName: 'Mercado', email: 'gabriel@brgynexus.com', phone: '09101010101', address: '777 Narra St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1993-09-03') },
    { firstName: 'Hazel', lastName: 'Gonzaga', email: 'hazel@brgynexus.com', phone: '09121212121', address: '888 Rizal Ave.', gender: 'FEMALE', civilStatus: 'MARRIED', birthdate: new Date('1989-11-20') },
    { firstName: 'Ian', lastName: 'Pineda', email: 'ian@brgynexus.com', phone: '09131313131', address: '999 Bonifacio St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1995-01-30') },
    { firstName: 'Jasmin', lastName: 'Alcantara', email: 'jasmin@brgynexus.com', phone: '09141414141', address: '124 Mabini St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1997-08-08') },
    { firstName: 'Kevin', lastName: 'Ocampo', email: 'kevin@brgynexus.com', phone: '09151515151', address: '235 Sampaguita St.', gender: 'MALE', civilStatus: 'MARRIED', birthdate: new Date('1986-06-25') },
    { firstName: 'Liza', lastName: 'Soberano', email: 'liza@brgynexus.com', phone: '09161616161', address: '346 Narra St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1998-01-04') },
    { firstName: 'Manuel', lastName: 'Quezon', email: 'manuel@brgynexus.com', phone: '09171717171', address: '457 Rizal Ave.', gender: 'MALE', civilStatus: 'WIDOWED', birthdate: new Date('1978-08-19') },
    { firstName: 'Nicole', lastName: 'Aquino', email: 'nicole@brgynexus.com', phone: '09181818181', address: '568 Bonifacio St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1994-12-15') },
    { firstName: 'Oscar', lastName: 'Romero', email: 'oscar@brgynexus.com', phone: '09191919191', address: '679 Mabini St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1990-03-24') },
    { firstName: 'Patricia', lastName: 'Evangelista', email: 'patricia@brgynexus.com', phone: '09202020202', address: '780 Sampaguita St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1992-06-18') },
    { firstName: 'Quirino', lastName: 'Roxas', email: 'quirino@brgynexus.com', phone: '09212121212', address: '891 Narra St.', gender: 'MALE', civilStatus: 'MARRIED', birthdate: new Date('1984-04-17') },
    { firstName: 'Rachel', lastName: 'Alejandro', email: 'rachel@brgynexus.com', phone: '09232323232', address: '902 Rizal Ave.', gender: 'FEMALE', civilStatus: 'MARRIED', birthdate: new Date('1985-02-11') },
    { firstName: 'Samuel', lastName: 'Banzon', email: 'samuel@brgynexus.com', phone: '09242424242', address: '135 Bonifacio St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1993-05-29') },
    { firstName: 'Theresa', lastName: 'Ramos', email: 'theresa@brgynexus.com', phone: '09252525252', address: '246 Mabini St.', gender: 'FEMALE', civilStatus: 'MARRIED', birthdate: new Date('1980-09-07') },
    { firstName: 'Victor', lastName: 'Magtanggol', email: 'victor@brgynexus.com', phone: '09262626262', address: '357 Sampaguita St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('1991-07-14') },
    { firstName: 'Wendy', lastName: 'Villanueva', email: 'wendy@brgynexus.com', phone: '09272727272', address: '468 Narra St.', gender: 'FEMALE', civilStatus: 'SINGLE', birthdate: new Date('1996-03-31') },
    { firstName: 'Xavier', lastName: 'Garcia', email: 'xavier@brgynexus.com', phone: '09282828282', address: '579 Rizal Ave.', gender: 'MALE', civilStatus: 'MARRIED', birthdate: new Date('1988-11-09') },
    { firstName: 'Elijah', lastName: 'Eero', email: 'elijah@brgynexus.com', phone: '09303030303', address: '789 Sampaguita St.', gender: 'MALE', civilStatus: 'SINGLE', birthdate: new Date('2000-01-01') },
  ];

  const seededAdditionalProfiles = [];
  for (const res of additionalResidents) {
    const user = await prisma.user.upsert({
      where: { email: res.email },
      update: {},
      create: {
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email,
        passwordHash,
        phone: res.phone,
        role: 'RESIDENT'
      }
    });

    const profile = await prisma.residentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        address: res.address,
        gender: res.gender,
        civilStatus: res.civilStatus,
        birthdate: res.birthdate,
        isVerified: true,
        residentType: 'PERMANENT'
      }
    });
    seededAdditionalProfiles.push(profile);
  }

  console.log('✓ Seeded Users & Profiles');
  return { 
    admin, 
    staff, 
    residents: [
      profile1, 
      profile2, 
      johnEarlProfile, 
      profile3, 
      profile4, 
      profile5,
      ...seededAdditionalProfiles
    ] 
  };
}
