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
    const documentData = docReq.document;
    
    // Parse template
    let bodyText = documentData.templateContent || "This is to certify that Mr./Ms. {{residentName}}, of legal age, is a bonafide resident of {{address}}, Barangay Nexus.\n\nBased on the records of this office, the above-named individual has no derogatory record or pending case filed against him/her in this barangay as of this date.\n\nThis certification is being issued upon the request of the interested party for the following purpose:\n{{purpose}}";

    bodyText = bodyText.replace(/{{residentName}}/g, `${resident.user.firstName} ${resident.user.lastName}`);
    bodyText = bodyText.replace(/{{address}}/g, resident.address);
    bodyText = bodyText.replace(/{{purpose}}/g, docReq.translatedPurpose || docReq.purpose);
    bodyText = bodyText.replace(/{{date}}/g, format(issuedDoc.issuedDate || new Date(), 'MMMM d, yyyy'));

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
      qrCodeDataUrl: qrDataUrl,
      issuedDate: issuedDoc.issuedDate || new Date(),
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
