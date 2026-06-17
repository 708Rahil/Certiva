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

  return [...routes, ...certUrls];
}
