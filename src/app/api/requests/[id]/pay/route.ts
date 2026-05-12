import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import crypto from 'crypto';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    
    // Only residents can pay, or we could allow staff. For now, allow resident.
    if (payload.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'Only residents can perform this action' }, { status: 403 });
    }

    // Get request to ensure it is APPROVED and belongs to the user
    const docRequest = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        document: true,
        resident: {
          include: { user: true }
        }
      }
    });

    if (!docRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (docRequest.resident.userId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (docRequest.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Request must be APPROVED before payment' }, { status: 400 });
    }

    // Simulate payment processing...
    // 1. Create Payment Record
    // 2. Change Status to RELEASED
    // 3. Create IssuedDocument
    
    const qrCodeHash = crypto.randomUUID();
    // Generate a document number: DOC-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const documentNumber = `DOC-${dateStr}-${randomHex}`;

    const transaction = await prisma.$transaction([
      prisma.payment.create({
        data: {
          requestId: id,
          amount: docRequest.document.fee || 50, // default fee if 0
          paymentMethod: 'GCASH', // Simulated
          referenceNo: `SIM-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
        }
      }),
      prisma.documentRequest.update({
        where: { id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          statusLogs: {
            create: {
              status: 'RELEASED',
              remarks: 'Payment successful. Document issued online.',
              changedById: payload.userId as string,
            }
          }
        }
      }),
      prisma.issuedDocument.create({
        data: {
          requestId: id,
          documentNumber,
          qrCodeHash,
        }
      })
    ]);

    return NextResponse.json({ success: true, issuedDocument: transaction[2] });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
