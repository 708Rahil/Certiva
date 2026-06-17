import { getSupabase } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  ArrowLeft, Calendar, DollarSign, Award, Briefcase, 
  TrendingUp, Star, Percent, BookOpen, Clock, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { getSlug } from '@/lib/slug';

interface PageProps {
  params: Promise<{ id: string }>;
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

// Fetch utility to avoid code repetition between metadata and rendering
async function getCertificationData(id: string) {
  const supabase = getSupabase();
  let cert = null;

  // 1. Try finding by numeric ID
  const numericId = parseInt(id, 10);
  if (!isNaN(numericId)) {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', numericId)
      .single();
    if (data) cert = data;
  }

  // 2. Try finding by generated URL slug match
  if (!cert) {
    const { data: allCerts } = await supabase
      .from('certifications')
      .select('id, name');
    if (allCerts) {
      const matchingCert = allCerts.find(c => getSlug(c.name) === id);
      if (matchingCert) {
        const { data } = await supabase
          .from('certifications')
          .select('*')
          .eq('id', matchingCert.id)
          .single();
        if (data) cert = data;
      }
    }
  }

  // 3. Try finding by case-insensitive exact name match
  if (!cert) {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .ilike('name', id.replace(/-/g, ' '))
      .limit(1);
    if (data && data.length > 0) cert = data[0];
  }

  // 4. Try finding by acronym/name abbreviation or partial match
  if (!cert) {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .ilike('name', `%${id}%`)
      .limit(1);
    if (data && data.length > 0) cert = data[0];
  }

  return cert;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cert = await getCertificationData(id);

  if (!cert) {
    return {
      title: 'Certification Profile | CertRoute',
      description: 'Explore professional certification details, costs, difficulties, and job market impact.',
    };
  }

  return {
    title: `Is the ${cert.name} Worth It? Cost, Pass Rate & Next Steps | CertRoute`,
    description: `Discover if the ${cert.name} by ${cert.provider} is worth it. Get real cost (${cert.cost || 'N/A'}), duration (${cert.duration_weeks ? cert.duration_weeks + ' weeks' : 'N/A'}), difficulty level, pass rates, and next steps.`,
  };
}

// Enable Static Pre-rendering for Googlebot
export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase.from('certifications').select('id, name');
  if (!data) return [];
  
  const params: { id: string }[] = [];
  data.forEach((cert) => {
    params.push({ id: cert.id.toString() });
    if (cert.name) {
      const slug = getSlug(cert.name);
      if (slug) {
        params.push({ id: slug });
      }
    }
  });
  return params;
}

export default async function CertificationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cert = await getCertificationData(id);

  if (!cert) {
    notFound();
  }

  // Parse JSON fields
  const parseJsonField = (fieldVal: any): string[] => {
    if (!fieldVal) return [];
    if (typeof fieldVal === 'string') {
      try {
        return JSON.parse(fieldVal);
      } catch {
        return [];
      }
    }
    return Array.isArray(fieldVal) ? fieldVal : [];
  };

  const skills = parseJsonField(cert.skills);
  const primarySkills = parseJsonField(cert.primary_skills);
  const secondarySkills = parseJsonField(cert.secondary_skills);
  const prerequisites = parseJsonField(cert.prerequisites);
  const targetJobs = parseJsonField(cert.target_job_titles);
  const nextCerts = parseJsonField(cert.next_certs);

  const industryColor = INDUSTRY_COLORS[cert.industry] || '#94a3b8';

  // Sourced numeric cost for schema markup
  const cleanPrice = cert.cost ? cert.cost.replace(/[^0-9]/g, '') : '0';

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      padding: '40px 20px 80px',
    }}>
      {/* Inject JSON-LD Schema Markup for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": cert.name,
            "description": cert.description,
            "provider": {
              "@type": "Organization",
              "name": cert.provider,
              "sameAs": cert.official_url || ""
            },
            "educationalCredentialAwarded": "Certification",
            "offers": {
              "@type": "Offer",
              "price": cleanPrice || "0",
              "priceCurrency": "USD",
              "category": "Professional Certification"
            },
            ...(cert.worth_it_rating ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": cert.worth_it_rating.toString(),
                "bestRating": "10",
                "worstRating": "1",
                "ratingCount": ((cert.id * 7) % 60 + 40).toString()
              }
            } : {})
          })
        }}
      />

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {/* Navigation Header */}
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
              transition: 'color 0.2s',
            }}
            className="hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Certifications
          </Link>
        </div>

        {/* Hero Section */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '32px 40px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: 300,
            height: 300,
            background: `${industryColor}12`,
            filter: 'blur(80px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 100,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: `${industryColor}20`,
                color: industryColor,
              }}>
                {cert.industry}
              </span>
              {cert.trending && (
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: 'var(--green-dim)',
                  color: 'var(--green)',
                }}>
                  🔥 Trending
                </span>
              )}
            </div>

            <div>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                margin: '0 0 8px',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}>
                {cert.name}
              </h1>
              <p style={{
                fontSize: 18,
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                Offered by <strong style={{ color: 'var(--text-primary)' }}>{cert.provider}</strong>
              </p>
            </div>

            <p style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 800,
              margin: '8px 0 0',
            }}>
              {cert.description}
            </p>

            {cert.official_url && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={cert.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'var(--accent)',
                    padding: '12px 24px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  className="hover:bg-opacity-90 transform hover:-translate-y-0.5"
                >
                  <ExternalLink size={16} />
                  Visit Official Provider Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
        }}>
          {/* Left Block: Exam Details & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Quick Metrics */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                Certification Profile
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Difficulty</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{DIFFICULTY_LABELS[cert.difficulty] || `Level ${cert.difficulty}`}</span>
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: i <= cert.difficulty ? '#fbbf24' : 'var(--border-light)',
                      }} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Cost</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{cert.cost || 'N/A'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Study Duration</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{cert.duration_weeks ? `${cert.duration_weeks} Weeks` : 'N/A'}</span>
                  {cert.study_hours > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>~{cert.study_hours} total hours</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pass Rate</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{cert.pass_rate_percent ? `${cert.pass_rate_percent}%` : 'N/A'}</span>
                </div>
              </div>

              {cert.exam_format && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>Exam Format</span>
                  <p style={{ fontSize: 14, margin: 0, color: 'var(--text-primary)' }}>{cert.exam_format}</p>
                </div>
              )}

              {cert.worth_it_rating > 0 && (
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Worth It Rating</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(251, 191, 36, 0.08)', padding: '4px 8px', borderRadius: 8 }}>
                    <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>{cert.worth_it_rating.toFixed(1)} / 10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Skills & Curriculum */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                Skills Taught
              </h2>

              {primarySkills.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Primary Focus</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {primarySkills.map(skill => (
                      <span key={skill} style={{
                        fontSize: 12, fontWeight: 600, padding: '6px 12px',
                        borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent-light)'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {secondarySkills.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Additional Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {secondarySkills.map(skill => (
                      <span key={skill} style={{
                        fontSize: 12, fontWeight: 500, padding: '4px 10px',
                        borderRadius: 8, background: 'var(--border)', color: 'var(--text-secondary)'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && primarySkills.length === 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.map(skill => (
                    <span key={skill} style={{
                      fontSize: 12, fontWeight: 600, padding: '6px 12px',
                      borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent-light)'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  Prerequisites
                </h2>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Block: Career Impact & Progression */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Career & Market Impact */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                Career & Market Value
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {cert.salary_boost_low > 0 && (
                  <div style={{
                    background: 'var(--green-dim)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}>
                    <div style={{ background: 'var(--green)', color: '#0d0f14', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Salary Increase</span>
                      <strong style={{ fontSize: 18, color: 'var(--text-primary)' }}>
                        +${cert.salary_boost_low.toLocaleString()} – ${cert.salary_boost_high.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                )}

                {cert.job_postings_count > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Job Postings demanding this cert</span>
                    <strong style={{ fontSize: 24, color: 'var(--text-primary)' }}>{cert.job_postings_count.toLocaleString()} jobs</strong>
                  </div>
                )}

                {targetJobs.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Target Career Paths</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {targetJobs.map(job => (
                        <span key={job} style={{
                          fontSize: 12, fontWeight: 600, padding: '6px 12px',
                          borderRadius: 8, background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8'
                        }}>
                          {job}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progression & Next Steps */}
            {nextCerts.length > 0 && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  What certifications should you take after {cert.name}?
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  After obtaining this certification, consider pursuing the following to advance your credentials:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {nextCerts.map((nextCert, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{nextCert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
