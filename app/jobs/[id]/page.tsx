'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import CertCard from '@/components/CertCard';
import ScoreRing from '@/components/ScoreRing';

interface Rec {
  id: number;
  cert_id: number;
  score: number;
  skill_overlap: number;
  industry_match: number;
  difficulty_fit: number;
  matched_skills: string;
  explanation: string;
  name: string;
  industry: string;
  skills: string;
  difficulty: number;
  description: string;
  provider: string;
  cost: string;
  duration_weeks?: number;
  pass_rate_percent?: number;
  salary_boost_low?: number;
  salary_boost_high?: number;
  official_url?: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  extracted_skills: string;
  created_at: string;
  user_id?: string | null;
}

const INDUSTRY_COLORS: Record<string, string> = {
  cloud: '#4f6ef7', data: '#34d399', cybersecurity: '#f87171',
  finance: '#fbbf24', marketing: '#a78bfa', management: '#38bdf8', general: '#94a3b8',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(data => {
        setJob(data.job);
        setRecs(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const { isLoaded, userId } = useAuth();

  if (loading) return <LoadingState />;
  if (!job) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Job not found.</div>;

  const skills: string[] = JSON.parse(job.extracted_skills || '[]');
  const topScore = recs[0]?.score || 0;
  const industries = [...new Set(recs.map(r => r.industry))];

  const filtered = filterIndustry === 'all' ? recs : recs.filter(r => r.industry === filterIndustry);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Back */}
      <Link href="/jobs" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
        ← All Jobs
      </Link>

      {/* Guest Callout Banner */}
      {isLoaded && !userId && !job.user_id && (
        <div className="animate-fade-up" style={{
          background: 'var(--accent-dim)',
          border: '1px solid rgba(79,110,247,0.3)',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--accent-light)' }}>
              ⚡ Save This Analysis to Your Account
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              This is a temporary guest analysis. Sign up or sign in to save it to your history.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/sign-in" style={{
              background: 'transparent',
              border: '1px solid rgba(79,110,247,0.4)',
              color: 'var(--accent-light)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}>
              Sign In
            </Link>
            <Link href="/sign-up" style={{
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
            }}>
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* Job header card */}
      <div className="animate-fade-up" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Job Analysis
            </div>
            <h1 style={{
              margin: '0 0 6px',
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 400, letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
            }}>{job.title}</h1>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>{job.company}</div>

            {/* Extracted skills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Extracted Skills ({skills.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.map(s => (
                  <span key={s} style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 100,
                    background: 'var(--border)', color: 'var(--text-secondary)', fontWeight: 500,
                  }}>{s}</span>
                ))}
                {skills.length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills extracted.</span>
                )}
              </div>
            </div>

            {/* Description toggle */}
            <div>
              <button
                onClick={() => setShowFullDesc(v => !v)}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 13, color: 'var(--accent-light)', fontFamily: 'var(--font-body)',
                }}
              >
                {showFullDesc ? '↑ Hide description' : '↓ Show full job description'}
              </button>
              {showFullDesc && (
                <div style={{
                  marginTop: 12, fontSize: 13, color: 'var(--text-secondary)',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap',
                  maxHeight: 260, overflowY: 'auto',
                  background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '14px 16px',
                }}>
                  {job.description}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 140 }}>
            <StatBubble label="Best Match" value={`${topScore}`} unit="/ 100" accent />
            <StatBubble label="Certs Found" value={`${recs.length}`} />
            <StatBubble label="Skills Detected" value={`${skills.length}`} />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      {industries.length > 1 && (
        <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <FilterChip label="All" value="all" active={filterIndustry === 'all'} onClick={() => setFilterIndustry('all')} />
          {industries.map(ind => (
            <FilterChip key={ind} label={ind} value={ind} active={filterIndustry === ind}
              onClick={() => setFilterIndustry(ind)} color={INDUSTRY_COLORS[ind]} />
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Recommended Certifications
          </h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((rec, i) => (
              <CertCard
                key={rec.id}
                rank={recs.indexOf(rec) + 1}
                name={rec.name}
                provider={rec.provider}
                industry={rec.industry}
                difficulty={rec.difficulty}
                score={rec.score}
                skillOverlap={rec.skill_overlap}
                industryMatch={!!rec.industry_match}
                matchedSkills={JSON.parse(rec.matched_skills || '[]')}
                explanation={rec.explanation}
                description={rec.description}
                cost={rec.cost}
                duration={rec.duration_weeks ? `${rec.duration_weeks} weeks` : undefined}
                official_url={rec.official_url}
                animDelay={i * 60}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBubble({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? 'var(--accent-dim)' : 'rgba(0,0,0,0.2)',
      border: `1px solid ${accent ? 'rgba(79,110,247,0.3)' : 'var(--border)'}`,
      borderRadius: 12, padding: '12px 16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent ? 'var(--accent-light)' : 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        {value}<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>{unit}</span>
      </div>
    </div>
  );
}

function FilterChip({ label, value, active, onClick, color }: { label: string; value: string; active: boolean; onClick: () => void; color?: string }) {
  const c = color || 'var(--accent)';
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${c}20` : 'var(--bg-card)',
        border: `1px solid ${active ? `${c}60` : 'var(--border)'}`,
        borderRadius: 100, padding: '5px 14px',
        fontSize: 13, fontWeight: 500,
        color: active ? c : 'var(--text-secondary)',
        cursor: 'pointer', fontFamily: 'var(--font-body)',
        textTransform: 'capitalize', transition: 'all 0.15s',
      }}
    >{label}</button>
  );
}

function LoadingState() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'var(--bg-card)', borderRadius: 16, height: 140,
          marginBottom: 16,
          backgroundImage: 'linear-gradient(90deg, var(--bg-card) 0%, var(--border) 50%, var(--bg-card) 100%)',
          backgroundSize: '200% 100%',
          animation: `shimmer 1.4s ease infinite ${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No matches in this category</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Try selecting a different filter above.</div>
    </div>
  );
}
