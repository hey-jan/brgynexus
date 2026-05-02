import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { z } from 'zod';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

const profileUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { 
        residentProfile: true,
        staffAssignments: true
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    const body = await request.json();
    
    const validatedData = profileUpdateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        residentProfile: validatedData.address ? {
          update: {
            address: validatedData.address
          }
        } : undefined
      },
      include: {
        residentProfile: true
      }
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json(safeUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
