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
    
    let requests;
    if (payload.role === 'RESIDENT') {
      const profile = await prisma.residentProfile.findUnique({ where: { userId: payload.userId as string } });
      if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      
      requests = await prisma.documentRequest.findMany({
        where: { residentId: profile.id },
        include: { document: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      requests = await prisma.documentRequest.findMany({
        include: { 
          document: true, 
          resident: { include: { user: true } } 
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'RESIDENT') return NextResponse.json({ error: 'Only residents can request documents' }, { status: 403 });

    const { documentId, purpose } = await request.json();
    if (!documentId || !purpose) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const profile = await prisma.residentProfile.findUnique({ where: { userId: payload.userId as string } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const documentRequest = await prisma.documentRequest.create({
      data: {
        residentId: profile.id,
        documentId,
        purpose,
        status: 'PENDING',
      },
    });

    return NextResponse.json(documentRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
