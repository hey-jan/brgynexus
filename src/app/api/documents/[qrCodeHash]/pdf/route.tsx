import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ClearancePDF } from '@/components/features/documents/ClearancePDF';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';
import { format } from 'date-fns';

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

    // Fetch Global Settings
    let settings = await prisma.barangaySettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = {
        id: 'default',
        barangayName: 'Barangay Nexus',
        city: 'City/Municipality',
        province: 'Province',
        logoUrl: null,
        captainName: 'Hon. Juan Dela Cruz',
        captainTitle: 'Punong Barangay',
        signatureUrl: null,
        updatedAt: new Date()
      };
    }

    // Generate Verification URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verify/${qrCodeHash}`;

    // Generate QR Code as Data URI
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const resident = issuedDoc.request.resident;
    const documentData = issuedDoc.request.document;
    
    // Parse template
    let bodyText = documentData.templateContent || "This is to certify that Mr./Ms. {{residentName}}, of legal age, is a bonafide resident of {{address}}, Barangay Nexus.\n\nBased on the records of this office, the above-named individual has no derogatory record or pending case filed against him/her in this barangay as of this date.\n\nThis certification is being issued upon the request of the interested party for the following purpose:\n{{purpose}}";

    bodyText = bodyText.replace(/{{residentName}}/g, `${resident.user.firstName} ${resident.user.lastName}`);
    bodyText = bodyText.replace(/{{address}}/g, resident.address);
    bodyText = bodyText.replace(/{{purpose}}/g, issuedDoc.request.translatedPurpose || issuedDoc.request.purpose);
    bodyText = bodyText.replace(/{{date}}/g, format(issuedDoc.issuedDate, 'MMMM d, yyyy'));

    // Helper to process base64 image strings into Buffers for React PDF
    const processImage = (dataUri: string | null | undefined) => {
      if (!dataUri) return undefined;
      if (typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
        const base64Data = dataUri.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }
      return dataUri;
    };

    const pdfProps = {
      documentName: documentData.name,
      documentNumber: issuedDoc.documentNumber,
      qrCodeDataUrl,
      issuedDate: issuedDoc.issuedDate,
      bodyText,
      settings: {
        barangayName: settings.barangayName,
        city: settings.city,
        province: settings.province,
        captainName: settings.captainName,
        captainTitle: settings.captainTitle,
        logoUrl: processImage(settings.logoUrl),
        signatureUrl: processImage(settings.signatureUrl),
      }
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
