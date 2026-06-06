import { MetadataRoute } from 'next';
import { getSupabase } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://certiva.com';
  const supabase = getSupabase();

  // Query all certification IDs to generate details page URLs
  const { data: certs } = await supabase.from('certifications').select('id');

  const certUrls = (certs || []).map((cert) => ({
    url: `${baseUrl}/certifications/${cert.id}`,
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

  return [...routes, ...certUrls];
}
