import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ClearancePDF } from '@/components/features/documents/ClearancePDF';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrCodeHash: string }> }) {
  try {
    const { qrCodeHash } = await params;

    const issuedDoc = await prisma.issuedDocument.findUnique({
      where: { qrCodeHash },
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

    if (!issuedDoc) {
      return new NextResponse('Document not found or invalid QR code', { status: 404 });
    }

    // Generate Verification URL based on the request origin or host
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verify/${qrCodeHash}`;

    // Generate QR Code as Data URI
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const pdfProps = {
      documentName: issuedDoc.request.document.name,
      residentName: `${issuedDoc.request.resident.user.firstName} ${issuedDoc.request.resident.user.lastName}`,
      address: issuedDoc.request.resident.address,
      purpose: issuedDoc.request.translatedPurpose || issuedDoc.request.purpose,
      documentNumber: issuedDoc.documentNumber,
      qrCodeDataUrl,
      issuedDate: issuedDoc.issuedDate,
    };

    // Render PDF to stream
    const pdfStream = await renderToStream(<ClearancePDF {...pdfProps} />);

    // Return the stream as a response
    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${issuedDoc.documentNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new NextResponse('Internal Server Error while generating PDF', { status: 500 });
  }
}
