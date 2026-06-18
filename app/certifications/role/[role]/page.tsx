import { getSupabase } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Award, DollarSign, Clock, ShieldCheck, ChevronRight, TrendingUp } from 'lucide-react';
import { getSlug } from '@/lib/slug';
import AddCertButton from '@/components/AddCertButton';

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

  // Group into stages for the visual roadmap
  const sortedCerts = [...certs].sort((a, b) => a.difficulty - b.difficulty);
  const stage1 = sortedCerts.filter(c => c.difficulty <= 2);
  const stage2 = sortedCerts.filter(c => c.difficulty === 3);
  const stage3 = sortedCerts.filter(c => c.difficulty >= 4);

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

        {/* List of matching certifications */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={22} style={{ color: 'var(--accent)' }} /> Recommended Credentials
          </h2>
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
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{cert.name}</h3>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AddCertButton certId={cert.id} certName={cert.name} small />
                      <Link 
                        href={`/certifications/${getSlug(cert.name)}`}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        Details <ChevronRight size={14} />
                      </Link>
                    </div>
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

        {/* Visual Sequenced Career Roadmap */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            Career Progression Roadmap
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Follow this step-by-step path to level up your credentials and expertise for a {roleName} role.
          </p>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Timeline connector line */}
            <div style={{
              position: 'absolute',
              left: 11,
              top: 16,
              bottom: 16,
              width: 2,
              background: 'linear-gradient(to bottom, var(--accent) 60%, var(--border))',
            }} />

            {[
              {
                title: "Step 1: Foundational Credentials",
                subtitle: "Build fundamental domain and tool familiarity",
                certs: stage1
              },
              {
                title: "Step 2: Associate Certifications",
                subtitle: "Demonstrate capability in standard frameworks and core tasks",
                certs: stage2
              },
              {
                title: "Step 3: Advanced & Specialist Expertise",
                subtitle: "Establish advanced authority, architectural competence, or direct alignment",
                certs: stage3
              }
            ]
              .filter(stage => stage.certs.length > 0)
              .map((stage, index) => (
                <div key={index} style={{ marginBottom: 44, position: 'relative' }}>
                  {/* Node Circle */}
                  <div style={{
                    position: 'absolute',
                    left: -32,
                    top: 2,
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '4px solid var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{index + 1}</span>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stage.title}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {stage.subtitle}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {stage.certs.map(c => {
                      return (
                        <div
                          key={c.id}
                          style={{
                            background: 'var(--bg-card)',
                            borderRadius: 14,
                            border: '1px solid var(--border)',
                            padding: 20,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                            <div>
                              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                {c.name}
                              </h4>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                {c.provider} • Difficulty {c.difficulty}/5
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <AddCertButton certId={c.id} certName={c.name} small />
                              <Link
                                href={`/certifications/${getSlug(c.name)}`}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                  textDecoration: 'none',
                                  border: '1px solid var(--border)',
                                  padding: '6px 14px',
                                  borderRadius: 8,
                                }}
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            {c.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </main>
  );
}
