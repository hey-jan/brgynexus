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
    if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all documents for the report
    const documents = await prisma.document.findMany();

    // Fetch all requests to calculate issuance counts and revenue per document type
    const requests = await prisma.documentRequest.findMany({
      where: { status: 'RELEASED' },
      include: { 
        document: true,
        resident: {
          include: { user: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const reportData = documents.map(doc => {
      const docRequests = requests.filter(r => r.documentId === doc.id);
      return {
        id: doc.id,
        name: doc.name,
        count: docRequests.length,
        revenue: docRequests.length * doc.fee,
      };
    });

    const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0);
    const totalIssued = reportData.reduce((sum, item) => sum + item.count, 0);

    return NextResponse.json({
      summary: reportData,
      totalRevenue,
      totalIssued,
      recentIssuances: requests.slice(0, 50).map(r => ({
        id: r.id,
        residentName: r.resident ? `${r.resident.user.firstName} ${r.resident.user.lastName}` : (r.guestName || "Unknown"),
        documentName: r.document.name,
        date: r.updatedAt,
        fee: r.document.fee
      }))
    });
  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
