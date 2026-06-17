import { getSupabase } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Award, DollarSign, Clock, ShieldCheck, ChevronRight, TrendingUp } from 'lucide-react';
import { getSlug } from '@/lib/slug';

interface PageProps {
  params: Promise<{ role: string }>;
}

const INDUSTRY_COLORS: Record<string, string> = {
  cloud: '#4f6ef7',
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
            href="/certifications"
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
            Back to Directory
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Best Certifications for a {roleName}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Sourced and verified directory of the most demanded credentials in the market to help you land a role as a {roleName}.
          </p>
        </div>

        {/* List of matching certifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {certs.map((cert) => {
            const industryColor = INDUSTRY_COLORS[cert.industry] || '#94a3b8';
            const skillsTaught = parseJsonField(cert.skills);

            return (
              <div 
                key={cert.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Upper row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{cert.name}</h2>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 100, textTransform: 'uppercase',
                        background: `${industryColor}20`, color: industryColor
                      }}>
                        {cert.industry}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Offered by {cert.provider}</div>
                  </div>

                  <Link 
                    href={`/certifications/${getSlug(cert.name)}`}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    View Breakdown <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Description */}
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {cert.description}
                </p>

                {/* Key metadata chips */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Difficulty: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{DIFFICULTY_LABELS[cert.difficulty]}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Cost: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{cert.cost || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Study Time: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{cert.duration_weeks ? `${cert.duration_weeks} Weeks` : 'N/A'}</strong>
                  </div>
                  {cert.salary_boost_low > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={14} style={{ color: 'var(--green)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>Est. Boost: </span>
                      <strong style={{ color: 'var(--green)' }}>+${cert.salary_boost_low.toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                {/* Skills taught */}
                {skillsTaught.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skillsTaught.slice(0, 5).map(skill => (
                      <span key={skill} style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text-secondary)'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
