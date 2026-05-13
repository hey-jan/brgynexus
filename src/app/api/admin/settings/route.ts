import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await jwtVerify(token, secret);
    // Any authenticated user might need settings (for documents), but for admin, we check role if needed.
    
    let settings = await prisma.barangaySettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.barangaySettings.create({
        data: { id: 'default' }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Upsert to ensure it exists
    const settings = await prisma.barangaySettings.upsert({
      where: { id: 'default' },
      update: body,
      create: {
        id: 'default',
        ...body
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('PATCH settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
