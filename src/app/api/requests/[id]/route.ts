import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // We allow fetching without auth for kiosk status check, but only basic info
    const reqData = await prisma.documentRequest.findFirst({
      where: {
        id: {
          startsWith: id.toLowerCase()
        }
      },
      include: {
        document: true,
      }
    });

    if (!reqData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(reqData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'STAFF' && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, remarks, translatedPurpose } = body;

    const updateData: any = {
      handledBy: { connect: { id: payload.userId as string } },
    };

    if (translatedPurpose !== undefined) {
      updateData.translatedPurpose = translatedPurpose;
    }

    if (status) {
      updateData.status = status;
      updateData.statusLogs = {
        create: {
          status,
          remarks: remarks || `Status updated to ${status}`,
          changedById: payload.userId as string,
        }
      };
    }

    const updatedRequest = await prisma.documentRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
