import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import QRCode from 'qrcode';
import React from 'react';
import { Page, Text, View, Document, StyleSheet, renderToStream, Image } from '@react-pdf/renderer';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

// Create styles for the PDF
const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 20 },
  body: { fontSize: 12, lineHeight: 1.5, marginBottom: 40 },
  signatureSection: { marginTop: 50, alignSelf: 'flex-end', textAlign: 'center' },
  signatureLine: { borderTop: '1px solid #000', width: 200, paddingTop: 5, marginTop: 40 },
  qrSection: { marginTop: 40, alignSelf: 'flex-start', alignItems: 'center' },
  qrImage: { width: 100, height: 100 },
  qrText: { fontSize: 8, marginTop: 5, color: '#666' }
});

// React PDF Component
const Certificate = ({ req, qrDataUrl, docNumber }: { req: any, qrDataUrl: string, docNumber: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>Republic of the Philippines</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>BARANGAY NEXUS</Text>
        <Text style={{ fontSize: 12 }}>City of Manila</Text>
      </View>
      
      <Text style={styles.title}>{req.document.name.toUpperCase()}</Text>
      
      <View style={styles.body}>
        <Text style={{ marginBottom: 20 }}>TO WHOM IT MAY CONCERN:</Text>
        <Text style={{ marginBottom: 20 }}>
          This is to certify that {req.resident.user.firstName.toUpperCase()} {req.resident.user.lastName.toUpperCase()}, 
          of legal age, {req.resident.civilStatus}, {req.resident.gender}, and a bona fide resident of 
          {req.resident.address}, is known to me to be of good moral character.
        </Text>
        <Text style={{ marginBottom: 20 }}>
          This certification is being issued upon the request of the interested party for:
        </Text>
        <Text style={{ fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
          {req.purpose}
        </Text>
        <Text>
          Issued this {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at Barangay Nexus.
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={styles.qrSection}>
          {qrDataUrl && <Image src={qrDataUrl} style={styles.qrImage} />}
          <Text style={styles.qrText}>Scan to Verify</Text>
          <Text style={styles.qrText}>Doc No: {docNumber}</Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>BARANGAY CAPTAIN</Text>
            <Text style={{ fontSize: 10 }}>Punong Barangay</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

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
    }

    // 4. Generate QR Code
    // In Phase 10, this hash will link to the verification portal.
    const verificationUrl = `http://localhost:3000/verify/${issuedDoc.qrCodeHash}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl);

    // 5. Generate PDF Stream
    const stream = await renderToStream(
      <Certificate req={docReq} qrDataUrl={qrDataUrl} docNumber={issuedDoc.documentNumber} />
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
