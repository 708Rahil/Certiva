import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db';
import { findAlternativePaths, extractProvider, getProviderColor } from '@/lib/roadmapMatcher';

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
      provider: extractProvider(cert.name),
      providerColor: getProviderColor(extractProvider(cert.name)),
    }));

    // Calculate alternatives for each cert
    const certsWithAlternatives = enrichedCerts.map((cert: any) => ({
      ...cert,
      alternatives: findAlternativePaths(cert, enrichedCerts, userCertMap),
    }));

    // Group by industry
    const byIndustry = certsWithAlternatives.reduce((acc: any, cert: any) => {
      if (!acc[cert.industry]) {
        acc[cert.industry] = [];
      }
      acc[cert.industry].push(cert);
      return acc;
    }, {});

    return Response.json({
      byIndustry,
      allCerts: certsWithAlternatives,
    });
  } catch (error) {
    console.error('Roadmap error:', error);
    return Response.json({ error: 'Failed to fetch roadmap', details: String(error) }, { status: 500 });
  }
}
