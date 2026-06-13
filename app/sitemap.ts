import { MetadataRoute } from 'next';
import { getSupabase } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://certiva.com';
  const supabase = getSupabase();

  // Query all certification IDs and target titles to generate sitemap URLs
  const { data: certs } = await supabase.from('certifications').select('id, target_job_titles');

  const certUrls = (certs || []).map((cert) => ({
    url: `${baseUrl}/certifications/${cert.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Generate dynamic role-specific roadmap paths from target_job_titles
  const roleSlugs = new Set<string>();
  (certs || []).forEach((cert) => {
    let titles: string[] = [];
    try {
      if (typeof cert.target_job_titles === 'string') {
        titles = JSON.parse(cert.target_job_titles || '[]');
      } else if (Array.isArray(cert.target_job_titles)) {
        titles = cert.target_job_titles;
      }
    } catch {
      titles = [];
    }

    titles.forEach((title) => {
      if (title && typeof title === 'string') {
        const slug = title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');
        if (slug) roleSlugs.add(slug);
      }
    });
  });

  const roleUrls = Array.from(roleSlugs).map((slug) => ({
    url: `${baseUrl}/certifications/role/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Standard static marketing and tool pages
  const routes = ['', '/certifications', '/jobs', '/profile', '/roadmap', '/terms', '/privacy'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...routes, ...certUrls, ...roleUrls];
}
