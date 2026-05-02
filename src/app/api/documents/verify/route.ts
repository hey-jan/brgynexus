import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('brgynexus_session='))?.split('=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'STAFF' && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentNumber = searchParams.get('documentNumber');

    if (!documentNumber) {
      return NextResponse.json({ error: 'Document number required' }, { status: 400 });
    }

    const document = await prisma.issuedDocument.findUnique({
      where: { documentNumber },
      include: {
        request: {
          include: {
            document: true,
            resident: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
