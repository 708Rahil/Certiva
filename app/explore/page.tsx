import { getSupabase } from '@/lib/db';
import ExploreClient from './ExploreClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Career Guides & Certifications | CertRoute',
  description: 'Browse the best certifications and structured career paths for popular technical roles in cloud, data science, cybersecurity, and management.',
};

export default async function ExplorePage() {
  const supabase = getSupabase();
  const { data: allCerts } = await supabase.from('certifications').select('*');

  const rolesMap = new Map<string, { name: string; slug: string; industry: string; certCount: number; certNames: string[] }>();

  (allCerts || []).forEach(cert => {
    let titles: string[] = [];
    if (cert.target_job_titles) {
      if (typeof cert.target_job_titles === 'string') {
        try {
          titles = JSON.parse(cert.target_job_titles);
        } catch {
          if (cert.target_job_titles.includes(',')) {
            titles = cert.target_job_titles.split(',').map((t: string) => t.trim());
          } else {
            titles = [cert.target_job_titles];
          }
        }
      } else if (Array.isArray(cert.target_job_titles)) {
        titles = cert.target_job_titles;
      }
    }

    titles.forEach((title: string) => {
      const cleanTitle = title.trim();
      if (!cleanTitle) return;
      const slug = cleanTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const key = slug;
      if (!rolesMap.has(key)) {
        rolesMap.set(key, {
          name: cleanTitle,
          slug,
          industry: cert.industry || 'general',
          certCount: 0,
          certNames: [],
        });
      }
      const roleObj = rolesMap.get(key)!;
      roleObj.certCount += 1;
      if (!roleObj.certNames.includes(cert.name) && roleObj.certNames.length < 3) {
        roleObj.certNames.push(cert.name);
      }
    });
  });

  const roles = Array.from(rolesMap.values()).sort((a, b) => b.certCount - a.certCount);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <ExploreClient initialRoles={roles} />
    </main>
  );
}
