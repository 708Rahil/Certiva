import { MetadataRoute } from 'next';
import { getSupabase } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://certroute.co';
  const supabase = getSupabase();

  // Query all certification IDs and names to generate details page URLs
  const { data: certs } = await supabase.from('certifications').select('id, name');
  const { getSlug } = require('@/lib/slug');

  const certUrls = (certs || []).map((cert) => ({
    url: `${baseUrl}/certifications/${getSlug(cert.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Standard static marketing and tool pages
  const routes = ['', '/certifications', '/jobs', '/profile', '/roadmap', '/terms', '/privacy'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // Dynamically extract and generate sitemap entries for all target job title roles
  const { data: roleData } = await supabase.from('certifications').select('target_job_titles');
  const rolesSet = new Set<string>();
  (roleData || []).forEach(cert => {
    let titles: string[] = [];
    if (cert.target_job_titles) {
      if (typeof cert.target_job_titles === 'string') {
        try { titles = JSON.parse(cert.target_job_titles); } catch {}
      } else if (Array.isArray(cert.target_job_titles)) {
        titles = cert.target_job_titles;
      }
    }
    titles.forEach((title: string) => {
      const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (slug) rolesSet.add(slug);
    });
  });

  const roleUrls = Array.from(rolesSet).map((role) => ({
    url: `${baseUrl}/certifications/role/${role}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...certUrls, ...roleUrls];
}
