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
    
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const logs = await prisma.requestStatusLog.findMany({
      include: {
        request: {
          include: {
            document: true,
            resident: { include: { user: true } }
          }
        },
        changedBy: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 entries
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
