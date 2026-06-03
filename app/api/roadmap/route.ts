import { auth } from '@clerk/nextjs/server';
import { getSupabase, initDb } from '@/lib/db';
import { findAlternativePaths, extractProvider, getProviderColor } from '@/lib/roadmapMatcher';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();

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

    const supabase = getSupabase();
    const { data: userCerts, error } = await supabase
      .from('user_certifications')
      .select('cert_id, status')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    const userCertMap = new Map<number, string>();
    userCerts?.forEach((row) => {
      userCertMap.set(row.cert_id, row.status);
    });

    const enrichedCerts = allCerts.map((cert) => ({
      ...cert,
      userStatus: userCertMap.get(cert.id) || null,
      provider: extractProvider(cert.name),
      providerColor: getProviderColor(extractProvider(cert.name)),
    }));

    const certsWithAlternatives = enrichedCerts.map((cert) => ({
      ...cert,
      alternatives: findAlternativePaths(cert, enrichedCerts, userCertMap),
    }));

    const byIndustry = certsWithAlternatives.reduce<Record<string, typeof certsWithAlternatives>>(
      (acc, cert) => {
        if (!acc[cert.industry]) {
          acc[cert.industry] = [];
        }
        acc[cert.industry].push(cert);
        return acc;
      },
      {}
    );

    return Response.json({
      byIndustry,
      allCerts: certsWithAlternatives,
    });
  } catch (error) {
    console.error('Roadmap error:', error);
    return Response.json(
      { error: 'Failed to fetch roadmap', details: String(error) },
      { status: 500 }
    );
  }
}
