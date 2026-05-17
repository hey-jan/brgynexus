import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, address, lengthOfStay, phone } = body;

    if (!firstName || !lastName || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate dummy email and password
    const dummyEmail = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}@brgynexus.local`;
    const passwordHash = await bcrypt.hash('temporary', 10);

    // Create User and Temporary Resident Profile
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: dummyEmail,
        passwordHash,
        phone: phone || null,
        role: 'RESIDENT',
        residentProfile: {
          create: {
            address,
            gender: 'OTHER', // Default or make it an input later if needed
            birthdate: new Date('1900-01-01'), // Default dummy date
            civilStatus: 'SINGLE', // Default
            isVerified: false,
            residentType: 'TEMPORARY',
            lengthOfStay: lengthOfStay || null,
          }
        }
      },
      include: {
        residentProfile: true
      }
    });

    return NextResponse.json(newUser.residentProfile, { status: 201 });
  } catch (error) {
    console.error('Temporary Resident creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
