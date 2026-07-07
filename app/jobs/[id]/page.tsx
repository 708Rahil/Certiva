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
  exam_parts?: any[];
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
  cloud: '#2563eb', data: '#34d399', cybersecurity: '#f87171',
  finance: '#fbbf24', marketing: '#a78bfa', management: '#38bdf8', general: '#94a3b8',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  type SortOption = 'score' | 'difficulty' | 'cost';
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const { isLoaded, userId } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [completedCertSkills, setCompletedCertSkills] = useState<string[]>([]);
  const [showScorecard, setShowScorecard] = useState(false);

  const handleAddToCerts = async (certId: number, certName: string) => {
    try {
      const response = await fetch('/api/user-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId,
          status: 'interested',
          startedDate: null,
          completedDate: null,
          notes: `Recommended from job: ${job?.title}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to add certification');

      // Show success message (you could add a toast here)
      alert(`✓ Added "${certName}" to My Certifications`);
    } catch (error) {
      console.error('Error adding certification:', error);
      alert('Failed to add certification. Please try again.');
    }
  };

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(data => {
        setJob(data.job);
        setRecs(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (userId) {
      fetch('/api/profile')
        .then(r => r.json())
        .then(data => {
          if (data && data.current_skills) {
            setUserSkills(data.current_skills);
          }
        })
        .catch(err => console.error('Error fetching profile:', err));

      fetch('/api/user-certifications')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const completed = data.filter((c: any) => c.status === 'completed');
            const skillsFromCerts = completed.flatMap((c: any) => {
              try {
                return JSON.parse(c.skills || '[]');
              } catch {
                return [];
              }
            });
            setCompletedCertSkills(skillsFromCerts);
          }
        })
        .catch(err => console.error('Error fetching user certifications:', err));
    }
  }, [id, userId]);

  if (loading) return <LoadingState />;
  if (!job) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Job not found.</div>;

  const skills: string[] = JSON.parse(job.extracted_skills || '[]');
  const topScore = recs[0]?.score || 0;
  const industries = [...new Set(recs.map(r => r.industry))];

  // Combined user skills from profile + completed certs
  const combinedUserSkills = [...userSkills, ...completedCertSkills];

  // Intersect combinedUserSkills and skills with substring matching (e.g., 'AWS' matching 'AWS Cloud')
  const matchedSkills = skills.filter(js => {
    const jobSkillLower = js.toLowerCase().trim();
    return combinedUserSkills.some(us => {
      const userSkillLower = us.toLowerCase().trim();
      if (!userSkillLower || !jobSkillLower) return false;
      return jobSkillLower === userSkillLower ||
        jobSkillLower.includes(userSkillLower) ||
        userSkillLower.includes(jobSkillLower);
    });
  });
  
  // Find missing skills
  const missingSkills = skills.filter(js => !matchedSkills.includes(js));

  // Match score calculation
  const matchPercent = skills.length > 0 
    ? Math.round((matchedSkills.length / skills.length) * 100) 
    : 0;

  // Bridge coverage calculation
  const bridgeSkills = new Set<string>();
  recs.forEach(rec => {
    const certSkills: string[] = JSON.parse(rec.skills || '[]');
    certSkills.forEach(cs => {
      if (missingSkills.some(ms => ms.toLowerCase() === cs.toLowerCase())) {
        bridgeSkills.add(cs.toLowerCase());
      }
    });
  });

  const bridgedCount = missingSkills.filter(ms => bridgeSkills.has(ms.toLowerCase())).length;
  const bridgePercent = missingSkills.length > 0
    ? Math.round((bridgedCount / missingSkills.length) * 100)
    : 0;

  const getCostValue = (costStr: string | undefined) => {
    if (!costStr || costStr.toLowerCase().includes('free')) return 0;
    const match = costStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 9999;
  };

  const filteredAndSorted = (filterIndustry === 'all' ? recs : recs.filter(r => r.industry === filterIndustry))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'difficulty') {
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        return b.score - a.score; // Tiebreaker
      }
      if (sortBy === 'cost') {
        const costA = getCostValue(a.cost);
        const costB = getCostValue(b.cost);
        if (costA !== costB) return costA - costB;
        return b.score - a.score; // Tiebreaker
      }
      return 0;
    });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
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

      {/* Main Content Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Job header card */}
        <div className="animate-fade-up" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '28px 32px',
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
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
              <StatBubble label="Certs Found" value={`${recs.length}`} accent />
              <StatBubble label="Skills Detected" value={`${skills.length}`} accent />
            </div>
          </div>
        </div>

        {/* Collapsible Career Readiness Scorecard Dropdown */}
        <div className="animate-fade-up delay-1" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}>
          {/* Accordion Trigger Header */}
          <button
            onClick={() => setShowScorecard(v => !v)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <h3 style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Career Readiness Scorecard
              </h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Compatibility: <strong style={{ color: 'var(--accent-light)' }}>{matchPercent}%</strong></span>
                <span style={{ width: 1, height: 14, background: 'var(--border)', alignSelf: 'center' }} />
                <span>Roadmap Bridge: <strong style={{ color: 'var(--accent-light)' }}>{bridgePercent}%</strong></span>
              </div>
              
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                transform: showScorecard ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}>
                ▼
              </span>
            </div>
          </button>

          {/* Accordion Content */}
          {showScorecard && (
            <div style={{
              padding: '0 24px 24px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(0, 0, 0, 0.05)',
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
            }}>
              {/* Col 1: Match Score Ring */}
              <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 16, paddingTop: 24 }}>
                <ScoreRing score={matchPercent} size={80} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {matchPercent}% Compatibility
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Based on profile vs. job requirements.
                  </p>
                </div>
              </div>

              {/* Col 2: The Skill Gap */}
              <div style={{ flex: '2 1 300px', paddingTop: 24 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Skill Breakdown ({skills.length})
                </h4>
                
                {isLoaded && (!userId || userSkills.length === 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Add your skills in your profile to calculate your matching status!
                    </p>
                    <Link href={userId ? "/profile" : "/sign-in"} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--accent-light)',
                      textDecoration: 'underline',
                    }}>
                      {userId ? "Edit Profile Skills →" : "Sign in to add skills →"}
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {matchedSkills.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>✓ MATCHED SKILLS ({matchedSkills.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {matchedSkills.map(skill => (
                            <span key={skill} style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 6,
                              background: 'var(--green-dim)', color: 'var(--green)', fontWeight: 500,
                            }}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {missingSkills.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 4 }}>⚠ MISSING SKILLS ({missingSkills.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {missingSkills.slice(0, 10).map(skill => (
                            <span key={skill} style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)',
                            }}>{skill}</span>
                          ))}
                          {missingSkills.length > 10 && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>+{missingSkills.length - 10} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Col 3: Roadmap Bridge Impact */}
              <div style={{ flex: '1.5 1 280px', paddingTop: 24 }}>
                <div style={{
                  background: 'rgba(79, 110, 247, 0.04)',
                  border: '1px solid rgba(79, 110, 247, 0.08)',
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--accent-light)' }}>
                    🚀 Roadmap Bridge Score
                  </h4>
                  
                  {missingSkills.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      You match all extracted skills for this job!
                    </p>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        This roadmap teaches **{bridgedCount}** of your missing skills.
                      </p>
                      <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 8,
                        height: 5,
                        overflow: 'hidden',
                        position: 'relative',
                        marginTop: 2,
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0, height: '100%',
                          width: `${bridgePercent}%`,
                          background: 'var(--accent)',
                          borderRadius: 8,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                        <span>Bridging {bridgePercent}% of the gap</span>
                        <span>{bridgedCount}/{missingSkills.length}</span>
                      </div>
                    </>
                  )}

                  {recs[0] && (
                    <div style={{ marginTop: 8, borderTop: '1px solid rgba(79, 110, 247, 0.1)', paddingTop: 12 }}>
                      <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                        TOP RECOMMENDATION
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {recs[0].name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>
                        {recs[0].explanation}
                      </div>
                      <button
                        onClick={() => handleAddToCerts(recs[0].cert_id, recs[0].name)}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                      >
                        Add to My Certifications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter bar */}
        {industries.length > 1 && (
          <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <FilterChip label="All" value="all" active={filterIndustry === 'all'} onClick={() => setFilterIndustry('all')} />
            {industries.map(ind => (
              <FilterChip key={ind} label={ind} value={ind} active={filterIndustry === ind}
                onClick={() => setFilterIndustry(ind)} color={INDUSTRY_COLORS[ind]} />
            ))}
          </div>
        )}

        {/* Recommendations */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Recommended Certifications
              </h2>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? 's' : ''}
              </span>
              <Link 
                href={`/roadmap?jobId=${job?.id}`}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.border = '1px solid var(--accent)'; e.currentTarget.style.padding = '5px 11px'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.border = 'none'; e.currentTarget.style.padding = '6px 12px'; }}
              >
                View Job Roadmap →
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="score">Best Match</option>
                <option value="difficulty">Difficulty (Low to High)</option>
                <option value="cost">Cost (Low to High)</option>
              </select>
            </div>
          </div>

          {filteredAndSorted.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredAndSorted.map((rec, i) => (
                <CertCard
                  key={rec.id}
                  rank={i + 1}
                  certId={rec.cert_id}
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
                  onAddToCerts={userId ? handleAddToCerts : undefined}
                  animDelay={i * 60}
                  exam_parts={rec.exam_parts}
                />
              ))}
            </div>
          )}
        </div>

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
