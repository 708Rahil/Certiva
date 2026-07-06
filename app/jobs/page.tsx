'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import LoggedOutState from '@/components/LoggedOutState';

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  extracted_skills: string;
  created_at: string;
}

interface JobWithTopIndustry extends Job {
  topCertIndustry?: string;
}

const INDUSTRY_COLORS: Record<string, string> = {
  cloud: '#2563eb', data: '#34d399', cybersecurity: '#f87171',
  finance: '#fbbf24', marketing: '#a78bfa', management: '#38bdf8',
};

function detectJobIndustry(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase();
  if (text.includes('security') || text.includes('cyber') || text.includes('siem')) return 'cybersecurity';
  if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('devops')) return 'cloud';
  if (text.includes('data') || text.includes('sql') || text.includes('analyt') || text.includes('machine learning')) return 'data';
  if (text.includes('financ') || text.includes('invest') || text.includes('trading')) return 'finance';
  if (text.includes('marketing') || text.includes('seo') || text.includes('ads')) return 'marketing';
  return 'general';
}

export default function JobsPage() {
  const { isLoaded, userId } = useAuth();
  const [jobs, setJobs] = useState<JobWithTopIndustry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job analysis?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job');
      
      setJobs(jobs => jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;

    fetch('/api/jobs')
      .then(r => r.json())
      .then(async (data) => {
        if (!Array.isArray(data)) {
          setJobs([]);
          setLoading(false);
          return;
        }

        // Fetch top recommendation for each job to get the industry
        const jobsWithIndustry = await Promise.all(
          data.map(async (job) => {
            try {
              const recRes = await fetch(`/api/jobs/${job.id}`);
              const recData = await recRes.json();
              const topIndustry = recData.recommendations?.[0]?.industry;
              return { ...job, topCertIndustry: topIndustry };
            } catch {
              return job;
            }
          })
        );

        setJobs(jobsWithIndustry);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return <LoadingState />;
  }

  if (!userId) {
    return (
      <LoggedOutState
        title="Access Your Saved Analyses"
        description="Create an account to keep a permanent history of all your analyzed job postings and matched certifications."
        features={[
          "Save up to 50 detailed job matches",
          "Scoped history accessible from any device",
          "Compare recommended certifications side-by-side",
          "Track skill keywords over time"
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 32,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            History
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 8px',
            fontFamily: 'var(--font-display)',
          }}>
            Saved Jobs
          </h1>
          <p style={{
            margin: 0,
            fontSize: 15,
            color: 'var(--text-secondary)',
          }}>
            Manage your analyzed job postings
          </p>
        </div>
        <Link href="/" style={{
          background: 'var(--accent)', color: '#fff', textDecoration: 'none',
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          marginBottom: 8,
        }}>
          + New Analysis
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 100, borderRadius: 16, background: 'var(--bg-card)',
              backgroundImage: 'linear-gradient(90deg, var(--bg-card) 0%, var(--border) 50%, var(--bg-card) 100%)',
              backgroundSize: '200% 100%',
              animation: `shimmer 1.4s ease infinite ${i * 0.15}s`,
            }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((job, i) => {
            const skills: string[] = JSON.parse(job.extracted_skills || '[]');
            const industry = job.topCertIndustry || detectJobIndustry(job.title, job.description);
            const color = INDUSTRY_COLORS[industry] || '#94a3b8';
            const date = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="animate-fade-up"
                style={{
                  animationDelay: `${i * 50}ms`,
                  textDecoration: 'none',
                  display: 'block',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = color;
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-card)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Industry dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginTop: 2,
                    background: `${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {industry === 'cloud' ? '☁️' : industry === 'data' ? '📊' : industry === 'cybersecurity' ? '🛡️' : industry === 'finance' ? '💹' : industry === 'marketing' ? '📣' : '💼'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                        background: `${color}20`, color,
                        textTransform: 'capitalize',
                      }}>{industry}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>{job.company}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {skills.slice(0, 6).map(s => (
                        <span key={s} style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 100,
                          background: 'var(--border)', color: 'var(--text-muted)',
                        }}>{s}</span>
                      ))}
                      {skills.length > 6 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{skills.length - 6} more</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textAlign: 'right' }}>{date}</div>
                      <div style={{ fontSize: 13, color: 'var(--accent-light)', fontWeight: 500, textAlign: 'right' }}>
                        View results →
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(job.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: 6,
                        marginTop: 12,
                        fontSize: 13,
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                      title="Delete saved job"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 20,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
      <h2 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, color: 'var(--text-primary)' }}>
        No saved jobs yet
      </h2>
      <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: 15 }}>
        Analyze your first job posting to see certification recommendations.
      </p>
      <Link href="/" style={{
        background: 'var(--accent)', color: '#fff', textDecoration: 'none',
        padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
      }}>
        → Start Your First Analysis
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 100, borderRadius: 16, background: 'var(--bg-card)',
            backgroundImage: 'linear-gradient(90deg, var(--bg-card) 0%, var(--border) 50%, var(--bg-card) 100%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.4s ease infinite ${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
