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

    // 1. Total Residents
    const totalResidents = await prisma.user.count({ where: { role: 'RESIDENT' } });

    // 2. Request Statuses
    const statuses = await prisma.documentRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const pendingCount = statuses.find(s => s.status === 'PENDING')?._count.status || 0;
    const releasedCount = statuses.find(s => s.status === 'RELEASED')?._count.status || 0;

    // 3. Document Fees Revenue
    const releasedRequests = await prisma.documentRequest.findMany({
      where: { status: 'RELEASED' },
      include: { document: true },
    });
    const totalRevenue = releasedRequests.reduce((sum, req) => sum + req.document.fee, 0);

    // 4. Volume Chart Data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRequests = await prisma.documentRequest.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const volumeByDate = recentRequests.reduce((acc: any, req) => {
      const dateStr = req.createdAt.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});

    const volumeChart = Object.keys(volumeByDate).sort().map(date => ({
      date,
      count: volumeByDate[date],
    }));

    const statusChart = statuses.map(s => ({
      name: s.status,
      value: s._count.status,
    }));

    return NextResponse.json({
      totalResidents,
      pendingCount,
      releasedCount,
      totalRevenue,
      statusChart,
      volumeChart,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
