import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import QRCode from 'qrcode';
import React from 'react';
import fs from 'fs';
import { Page, Text, View, Document, StyleSheet, renderToStream, Image } from '@react-pdf/renderer';
import path from 'path';
import { sendEmail } from '@/lib/resend';
import { RequestEmail } from '@/components/emails/RequestEmail';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

// Create styles for the PDF
import { ClearancePDF } from '@/components/features/documents/ClearancePDF';
import { format } from 'date-fns';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // 1. Auth check
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('brgynexus_session='))?.split('=')[1];
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'STAFF' && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Request Data
    const docReq = await prisma.documentRequest.findUnique({
      where: { id: resolvedParams.id },
      include: {
        document: true,
        resident: { include: { user: true } },
        issuedDocument: true
      }
    });

    if (!docReq) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (docReq.status !== 'APPROVED' && docReq.status !== 'RELEASED') {
      return NextResponse.json({ error: 'Document must be APPROVED before generation' }, { status: 400 });
    }

    // 3. Issue Document Record (if not already issued)
    let issuedDoc = docReq.issuedDocument;
    if (!issuedDoc) {
      const docNumber = `BRGY-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const qrCodeHash = `${docReq.id}-${Date.now()}`;
      
      issuedDoc = await prisma.issuedDocument.create({
        data: {
          requestId: docReq.id,
          documentNumber: docNumber,
          qrCodeHash: qrCodeHash
        }
      });

      // Update status to RELEASED
      await prisma.documentRequest.update({
        where: { id: docReq.id },
        data: { status: 'RELEASED', releasedAt: new Date() }
      });
      
      await prisma.requestStatusLog.create({
        data: {
          requestId: docReq.id,
          status: 'RELEASED',
          remarks: `Document ${docNumber} generated.`,
          changedById: payload.userId as string
        }
      });

      // 3.1 Send Email Notification
      /*
      await sendEmail({
        to: docReq.resident.user.email,
        subject: `Document Ready: ${docReq.document.name}`,
        react: (
          <RequestEmail 
            firstName={docReq.resident.user.firstName}
            documentName={docReq.document.name}
            status="RELEASED"
            docNumber={docNumber}
          />
        )
      });
      */
    }

    // 4. Generate QR Code
    // In Phase 10, this hash will link to the verification portal.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/verify/${issuedDoc.qrCodeHash}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl);

    // 5. Generate PDF Stream
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

    const resident = docReq.resident;
    const guestName = docReq.guestName;
    const guestAddress = docReq.guestAddress;
    const documentData = docReq.document;

    let residentName = "Unknown";
    let address = "Unknown";

    if (resident) {
      residentName = `${resident.user.firstName} ${resident.user.lastName}`;
      address = resident.address;
    } else if (guestName) {
      residentName = guestName;
      address = guestAddress || "Unknown";
    }

    // Parse template
    let bodyText = documentData.templateContent || "This is to certify that Mr./Ms. {{residentName}}, of legal age, is a bonafide resident of {{address}}, Barangay Nexus.\n\nBased on the records of this office, the above-named individual has no derogatory record or pending case filed against him/her in this barangay as of this date.\n\nThis certification is being issued upon the request of the interested party for the following purpose:\n{{purpose}}";

    bodyText = bodyText.replace(/{{residentName}}/g, residentName);
    bodyText = bodyText.replace(/{{address}}/g, address);
    bodyText = bodyText.replace(/{{purpose}}/g, docReq.translatedPurpose || docReq.purpose);
    bodyText = bodyText.replace(/{{date}}/g, format(issuedDoc.issuedDate || new Date(), 'MMMM d, yyyy'));

    const DEFAULT_SIGNATURE_BASE64 = 'data:image/png;base64,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';

    // Helper to process base64 image strings into Buffers for React PDF
    const processImage = (dataUri: string | null | undefined, fallbackPath?: string, fallbackBase64?: string) => {
      let uri = dataUri;
      if (!uri) {
        if (fallbackPath) {
          const absolutePath = path.join(process.cwd(), fallbackPath);
          if (fs.existsSync(absolutePath)) {
            return fs.readFileSync(absolutePath);
          }
        }
        if (fallbackBase64) {
          uri = fallbackBase64;
        } else {
          return undefined;
        }
      }
      if (typeof uri === 'string' && uri.startsWith('data:image')) {
        const base64Data = uri.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }
      return uri;
    };

    const pdfProps = {
      documentName: documentData.name,
      documentNumber: issuedDoc.documentNumber,
      qrCodeDataUrl: qrDataUrl,
      issuedDate: issuedDoc.issuedDate || new Date(),
      bodyText,
      settings: {
        barangayName: settings.barangayName,
        city: settings.city,
        province: settings.province,
        captainName: settings.captainName,
        captainTitle: settings.captainTitle,
        logoUrl: processImage(settings.logoUrl, 'public/images/brgy-seal.png'),
        signatureUrl: processImage(settings.signatureUrl, undefined, DEFAULT_SIGNATURE_BASE64),
      }
    };

    const stream = await renderToStream(
      <ClearancePDF {...pdfProps} />
    );

    // 6. Return standard Web Response Stream
    const webReadableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(webReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document_${issuedDoc.documentNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
