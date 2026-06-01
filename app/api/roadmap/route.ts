import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all certifications from all JSON files
    const cloudCerts = (await import('@/certs/cloud.json')).default;
    const dataCerts = (await import('@/certs/data.json')).default;
    const cybersecurityCerts = (await import('@/certs/cybersecurity.json')).default;
    const financeCerts = (await import('@/certs/finance.json')).default;
    const marketingCerts = (await import('@/certs/marketing.json')).default;
    const managementCerts = (await import('@/certs/management.json')).default;

    const allCerts = [
      ...cloudCerts,
      ...dataCerts,
      ...cybersecurityCerts,
      ...financeCerts,
      ...marketingCerts,
      ...managementCerts,
    ];

    // Get user's certifications
    const db = getDb();
    const userCerts = await db.execute(
      `SELECT cert_id, status FROM user_certifications WHERE user_id = ?`,
      [userId]
    );

    const userCertMap = new Map();
    userCerts.rows?.forEach((row: any) => {
      userCertMap.set(row.cert_id, row.status);
    });

    // Enrich certs with user progress and build dependency info
    const enrichedCerts = allCerts.map((cert: any) => ({
      ...cert,
      userStatus: userCertMap.get(cert.id) || null,
    }));

    // Group by industry
    const byIndustry = enrichedCerts.reduce((acc: any, cert: any) => {
      if (!acc[cert.industry]) {
        acc[cert.industry] = [];
      }
      acc[cert.industry].push(cert);
      return acc;
    }, {});

    return Response.json({
      byIndustry,
      allCerts: enrichedCerts,
    });
  } catch (error) {
    console.error('Roadmap error:', error);
    return Response.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}
