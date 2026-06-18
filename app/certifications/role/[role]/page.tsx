import { getSupabase } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Award, DollarSign, Clock, ShieldCheck, ChevronRight, TrendingUp } from 'lucide-react';
import { getSlug } from '@/lib/slug';
import AddCertButton from '@/components/AddCertButton';
import RoleContentTabs from './RoleContentTabs';

interface PageProps {
  params: Promise<{ role: string }>;
}

const INDUSTRY_COLORS: Record<string, string> = {
  cloud: '#2563eb',
  data: '#34d399',
  cybersecurity: '#f87171',
  finance: '#fbbf24',
  marketing: '#a78bfa',
  management: '#38bdf8',
  general: '#94a3b8',
};

const DIFFICULTY_LABELS = ['', 'Beginner', 'Beginner+', 'Intermediate', 'Advanced', 'Expert'];

function parseJsonField(fieldVal: any): string[] {
  if (!fieldVal) return [];
  if (typeof fieldVal === 'string') {
    try {
      return JSON.parse(fieldVal);
    } catch {
      return [];
    }
  }
  return Array.isArray(fieldVal) ? fieldVal : [];
}

// Clean and formatting slug helper (e.g. "software-developer" -> "Software Developer")
function formatRoleName(roleSlug: string): string {
  return roleSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fetch matching certifications
async function getRoleCertifications(roleSlug: string) {
  const supabase = getSupabase();
  const { data: allCerts } = await supabase.from('certifications').select('*');
  if (!allCerts) return [];

  // Filter in memory for maximum matching precision
  const targetRoleNameClean = roleSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

  return allCerts.filter(cert => {
    const titles = parseJsonField(cert.target_job_titles);
    return titles.some(title => 
      title.toLowerCase().replace(/[^a-z0-9]/g, '') === targetRoleNameClean ||
      title.toLowerCase().includes(roleSlug.replace(/-/g, ' '))
    );
  });
}

// Dynamic SEO Headings
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  const roleName = formatRoleName(role);
  return {
    title: `Best Certifications for a ${roleName} (2026 Guide) | CertRoute`,
    description: `Compare the top certifications to become a ${roleName}. Review exam costs, difficulties, study times, salary boosts, and market demand statistics.`,
  };
}

export default async function RoleCertificationsPage({ params }: PageProps) {
  const { role } = await params;
  const roleName = formatRoleName(role);
  const certs = await getRoleCertifications(role);

  if (certs.length === 0) {
    // If no certifications match, show a helpful layout rather than a hard crash
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', padding: '60px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>No Certifications Found</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            We couldn't find any direct certification recommendations specifically matched to "{roleName}" yet.
          </p>
          <Link href="/certifications" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>
            Browse all certifications
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      padding: '40px 20px 80px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: 32 }}>
          <Link 
            href="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Back to Explore
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Best Certifications for a {roleName}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Sourced and verified directory of the most demanded credentials in the market to help you land a role as a {roleName}.
          </p>
        </div>

        <RoleContentTabs 
          certs={certs} 
          roleName={roleName} 
          INDUSTRY_COLORS={INDUSTRY_COLORS} 
          DIFFICULTY_LABELS={DIFFICULTY_LABELS} 
        />

      </div>
    </main>
  );
}
