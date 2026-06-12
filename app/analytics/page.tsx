'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import LoggedOutState from '@/components/LoggedOutState';

interface AnalyticsData {
  jobCount: number;
  topCerts: { name: string; industry: string; difficulty: number; count: number; total_score: number; avg_score: number }[];
  topSkills: { skill: string; count: number }[];
  skillGaps: string[];
  recentJobs: { id: number; title: string; company: string; created_at: string }[];
}

const INDUSTRY_COLORS: Record<string, string> = {
  cloud: '#4f6ef7', data: '#34d399', cybersecurity: '#f87171',
  finance: '#fbbf24', marketing: '#a78bfa', management: '#38bdf8', general: '#94a3b8',
};

export default function AnalyticsPage() {
  const { isLoaded, userId } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return <LoadingState />;
  }

  if (!userId) {
    return (
      <LoggedOutState
        title="Unlock Career Analytics"
        description="Connect your account to visualize patterns, common skills, and certification recommendations across your history."
        features={[
          "Identify frequent target certifications",
          "Identify and highlight critical skill gaps",
          "Analyze distribution of job levels and industries",
          "Get personalized path recommendations"
        ]}
      />
    );
  }

  if (loading) return <LoadingState />;

  const isEmpty = !data || data.jobCount === 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Insights
        </div>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px' }}>
          Analytics Dashboard
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15 }}>
          Patterns across all your analyzed job postings
        </p>
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {/* Top stats row */}
          <div className="animate-fade-up delay-1 stats-grid">
            <BigStat label="Jobs Analyzed" value={String(data!.jobCount)} icon="📋" />
            <BigStat label="Most Recommended" value={data!.topCerts?.[0] ? data!.topCerts[0].name : '—'} icon="🏆" />
            <BigStat label="Unique Skills Found" value={String(data!.topSkills.length)} icon="⚡" />
          </div>

          <div className="dashboard-grid">
            {/* Top Certifications */}
            <div className="animate-fade-up delay-2" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '24px',
            }}>
              <SectionHeader title="Most Recommended" subtitle="By average score across all jobs" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data!.topCerts.slice(0, 6).map((cert, i) => {
                  const color = INDUSTRY_COLORS[cert.industry] || '#94a3b8';
                  const totalScore = cert.total_score || 0;
                  const avgScore = cert.count > 0 ? totalScore / cert.count : 0;
                  const pct = Math.round(avgScore);
                  return (
                    <div key={cert.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color,
                            minWidth: 16, textAlign: 'center',
                          }}>#{i + 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                            {cert.name}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {(avgScore || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: color, borderRadius: 2,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Skills */}
            <div className="animate-fade-up delay-3" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '24px',
            }}>
              <SectionHeader title="Most Common Skills" subtitle="Extracted from all job postings" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data!.topSkills.map(({ skill, count }, i) => {
                  const maxCount = data!.topSkills[0]?.count || 1;
                  const intensity = Math.max(0.2, count / maxCount);
                  return (
                    <div
                      key={skill}
                      style={{
                        padding: '5px 12px', borderRadius: 100,
                        background: `rgba(79,110,247,${intensity * 0.25})`,
                        border: `1px solid rgba(79,110,247,${intensity * 0.4})`,
                        fontSize: Math.max(11, Math.min(15, 11 + Math.floor(intensity * 4))),
                        fontWeight: i < 3 ? 600 : 500,
                        color: `rgba(107,133,249,${0.6 + intensity * 0.4})`,
                        cursor: 'default',
                      }}
                      title={`${count} job${count !== 1 ? 's' : ''}`}
                    >
                      {skill}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Skill Gaps */}
            <div className="animate-fade-up delay-4" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '24px',
            }}>
              <SectionHeader title="Skill Gaps" subtitle="Cert skills not yet appearing in your job postings" />
              {data!.skillGaps.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No significant gaps detected.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data!.skillGaps.map(skill => (
                    <div key={skill} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: 'var(--amber-dim)', border: '1px solid rgba(251,191,36,0.2)',
                    }}>
                      <span style={{ color: 'var(--amber)', fontSize: 12 }}>△</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{skill}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent jobs */}
            <div className="animate-fade-up delay-5" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '24px',
            }}>
              <SectionHeader title="Recent Analyses" subtitle="Your latest job postings" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data!.recentJobs.map(job => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    style={{
                      textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: 10,
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border)',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.company}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BigStat({ label, value, icon, unit }: { label: string; value: string; icon: string; unit?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
          {value}
          {unit && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 90, borderRadius: 16, background: 'var(--bg-card)',
            animation: `shimmer 1.4s ease infinite ${i * 0.1}s`,
            backgroundImage: 'linear-gradient(90deg, var(--bg-card) 0%, var(--border) 50%, var(--bg-card) 100%)',
            backgroundSize: '200% 100%',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            height: 300, borderRadius: 20, background: 'var(--bg-card)',
            animation: `shimmer 1.4s ease infinite ${i * 0.15}s`,
            backgroundImage: 'linear-gradient(90deg, var(--bg-card) 0%, var(--border) 50%, var(--bg-card) 100%)',
            backgroundSize: '200% 100%',
          }} />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <h2 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, color: 'var(--text-primary)' }}>
        No data yet
      </h2>
      <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: 15 }}>
        Analyze a few job postings to start seeing patterns and insights.
      </p>
      <Link href="/" style={{
        background: 'var(--accent)', color: '#fff', textDecoration: 'none',
        padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
      }}>
        → Analyze Your First Job
      </Link>
    </div>
  );
}
