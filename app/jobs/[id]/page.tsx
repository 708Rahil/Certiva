'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { getStripeCheckoutUrl } from '@/lib/stripe';
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

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const isPro = Boolean(user?.publicMetadata?.hasLifetimePass);
  const checkoutUrl = getStripeCheckoutUrl(user?.id, user?.primaryEmailAddress?.emailAddress);
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

  // Group recommendations into sequenced roadmap stages
  const stage1 = recs.filter(r => r.difficulty <= 2).sort((a, b) => b.score - a.score);
  const stage2 = recs.filter(r => r.difficulty === 3).sort((a, b) => b.score - a.score);
  const stage3 = recs.filter(r => r.difficulty >= 4).sort((a, b) => b.score - a.score);

  const rawStages = [
    {
      title: 'Foundational Credentials',
      subtitle: 'Build fundamental domain and tool familiarity',
      certs: stage1,
    },
    {
      title: 'Core Competency & Associate Credentials',
      subtitle: 'Demonstrate capability in standard frameworks and core tasks',
      certs: stage2,
    },
    {
      title: 'Advanced & Specialist Expertise',
      subtitle: 'Establish advanced authority and high-salary expertise',
      certs: stage3,
    },
  ].filter(s => s.certs.length > 0);

  const stages = rawStages.map((s, idx) => ({
    ...s,
    stepNumber: (idx + 1).toString(),
  }));

  const isMultiStage = stages.length > 1;

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
              <span style={{
                background: 'var(--accent-dim, rgba(37,99,235,0.1))',
                border: '1px solid var(--accent, #2563eb)',
                color: 'var(--accent, #2563eb)',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                letterSpacing: '0.05em',
              }}>
                PRO PASS
              </span>
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

              {/* Col 2 & 3: Detailed Breakdown & Bridge Score */}
              <div style={{
                flex: '3 1 500px',
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                paddingTop: 24,
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
              }}>
                {/* Frosted Lock Overlay (hidden for Pro members) */}
                {!isPro && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10,
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.92) 100%)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    textAlign: 'center',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'rgba(37,99,235,0.2)',
                      border: '1px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      marginBottom: 10,
                    }}>
                      🔒
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                      Unlock ATS Resume Match & Skill Gap Breakdown
                    </h4>
                    <p style={{ fontSize: 12, color: '#cbd5e1', maxWidth: 420, margin: '0 0 16px', lineHeight: 1.4 }}>
                      See every missing keyword your resume needs to pass recruiter filters and how recommended certifications boost your match rate.
                    </p>
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'var(--accent, #2563eb)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        padding: '10px 22px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                      }}
                    >
                      Unlock Lifetime Access — $9.99
                    </a>
                    <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
                      One-time payment · Instant digital delivery · Non-refundable
                    </span>
                  </div>
                )}

                {/* Col 2: The Skill Gap */}
                <div style={{
                  flex: '2 1 260px',
                  opacity: isPro ? 1 : 0.3,
                  pointerEvents: isPro ? 'auto' : 'none',
                  userSelect: isPro ? 'auto' : 'none',
                }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Skill Breakdown ({skills.length})
                  </h4>
                  
                  {isLoaded && (!userId || userSkills.length === 0) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        Add your skills in your profile to calculate your matching status!
                      </p>
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
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Col 3: Roadmap Bridge Impact */}
                <div style={{
                  flex: '1.5 1 240px',
                  opacity: isPro ? 1 : 0.3,
                  pointerEvents: isPro ? 'auto' : 'none',
                  userSelect: isPro ? 'auto' : 'none',
                }}>
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
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                      <span>Bridging {bridgePercent}% of the gap</span>
                      <span>{bridgedCount}/{missingSkills.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Career Certification Roadmap */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Career Certification Roadmap
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                Sequenced step-by-step credential path tailored to this role
              </p>
            </div>
            {isPro ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#2563eb',
                  background: 'var(--accent-dim, rgba(37, 99, 235, 0.08))',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                ⚡ PRO PASS ACTIVE
              </span>
            ) : (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'var(--accent, #2563eb)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                ⚡ Lifetime Pass $9.99
              </a>
            )}
          </div>

          {stages.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{
              position: 'relative',
              paddingLeft: 32,
              borderLeft: '2px solid var(--border)',
              marginLeft: 16,
            }}>
              {stages.map((stage, stageIdx) => {
                const isFinalStage = stageIdx === stages.length - 1;
                const isStageLocked = !isPro && isMultiStage && isFinalStage;
                const lockLastCert = !isPro && !isMultiStage && stage.certs.length >= 2;

                return (
                  <div key={stage.stepNumber} style={{ marginBottom: 44, position: 'relative' }}>
                    {/* Node Indicator */}
                    <div style={{
                      position: 'absolute',
                      left: -32,
                      top: 2,
                      transform: 'translateX(-50%)',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: isStageLocked ? '#f59e0b' : 'var(--accent)',
                      border: '4px solid var(--bg, #ffffff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>
                        {isStageLocked ? '🔒' : stage.stepNumber}
                      </span>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {stage.title}
                        </h3>
                        {isStageLocked && (
                          <span style={{
                            background: 'var(--accent-dim, rgba(37,99,235,0.1))',
                            border: '1px solid var(--accent, #2563eb)',
                            color: 'var(--accent, #2563eb)',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            letterSpacing: '0.05em',
                          }}>
                            PRO PASS
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {stage.subtitle}
                      </p>
                    </div>

                    {isStageLocked ? (
                      <div style={{
                        position: 'relative',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                      }}>
                        {/* Blurred Teaser Card */}
                        <div style={{
                          filter: 'blur(8px)',
                          opacity: 0.35,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}>
                          <CertCard
                            rank={stageIdx + 1}
                            certId={stage.certs[0].cert_id}
                            name={stage.certs[0].name}
                            provider={stage.certs[0].provider}
                            industry={stage.certs[0].industry}
                            difficulty={stage.certs[0].difficulty}
                            score={stage.certs[0].score}
                            skillOverlap={stage.certs[0].skill_overlap}
                            industryMatch={!!stage.certs[0].industry_match}
                            matchedSkills={JSON.parse(stage.certs[0].matched_skills || '[]')}
                            explanation={stage.certs[0].explanation}
                            description={stage.certs[0].description}
                            cost={stage.certs[0].cost}
                            duration={stage.certs[0].duration_weeks ? `${stage.certs[0].duration_weeks} weeks` : undefined}
                            official_url={stage.certs[0].official_url}
                          />
                        </div>

                        {/* Frosted Lock Overlay */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.92) 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 20px',
                          textAlign: 'center',
                          backdropFilter: 'blur(4px)',
                        }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'rgba(37,99,235,0.2)',
                            border: '1px solid #3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            marginBottom: 10,
                          }}>
                            🔒
                          </div>
                          <h4 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                            Unlock Step {stage.stepNumber}: {stage.title}
                          </h4>
                          <p style={{ fontSize: 13, color: '#cbd5e1', maxWidth: 460, margin: '0 0 16px', lineHeight: 1.5 }}>
                            Access the highest-salary specialist credentials, advanced authority paths, and unlimited job scans with the Lifetime Career Pass.
                          </p>
                          <a
                            href={checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'var(--accent, #2563eb)',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 14,
                              padding: '12px 24px',
                              borderRadius: 10,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                              transition: 'transform 0.15s ease',
                            }}
                          >
                            Unlock Lifetime Access — $9.99
                          </a>
                          <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                            One-time payment · Instant digital delivery · Non-refundable
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {stage.certs.map((rec, ci) => {
                          if (lockLastCert && ci === stage.certs.length - 1) {
                            return (
                              <div key={rec.id} style={{
                                position: 'relative',
                                borderRadius: 16,
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                              }}>
                                {/* Blurred Teaser Card */}
                                <div style={{
                                  filter: 'blur(8px)',
                                  opacity: 0.35,
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                }}>
                                  <CertCard
                                    rank={ci + 1}
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
                                  />
                                </div>

                                {/* Frosted Lock Overlay */}
                                <div style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.92) 100%)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '24px 20px',
                                  textAlign: 'center',
                                  backdropFilter: 'blur(4px)',
                                }}>
                                  <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'rgba(37,99,235,0.2)',
                                    border: '1px solid #3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    marginBottom: 8,
                                  }}>
                                    🔒
                                  </div>
                                  <h4 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                                    Final Certification Locked
                                  </h4>
                                  <p style={{ fontSize: 13, color: '#cbd5e1', maxWidth: 440, margin: '0 0 16px', lineHeight: 1.5 }}>
                                    Unlock the final certification on this career path, plus full ATS resume gap analysis with the Lifetime Career Pass.
                                  </p>
                                  <a
                                    href={checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      background: 'var(--accent, #2563eb)',
                                      color: '#fff',
                                      fontWeight: 700,
                                      fontSize: 14,
                                      padding: '11px 22px',
                                      borderRadius: 10,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                                    }}
                                  >
                                    Unlock with Lifetime Pass — $9.99
                                  </a>
                                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                                    One-time payment · Instant digital delivery · Non-refundable
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <CertCard
                              key={rec.id}
                              rank={ci + 1}
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
                              animDelay={ci * 60}
                              exam_parts={rec.exam_parts}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
