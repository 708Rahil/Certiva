'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Award, Briefcase, ChevronRight, CheckCircle, Clock, BookOpen, AlertCircle, Sparkles, Map as MapIcon } from 'lucide-react';
import { getSlug } from '@/lib/slug';
import AddCertButton from '@/components/AddCertButton';

interface Cert {
  id: number;
  name: string;
  difficulty: number;
  provider: string;
  providerColor?: string;
  userStatus?: string;
  score?: number;
  explanation?: string;
  matchedSkills?: string[];
  description?: string;
  alternatives?: any[];
  next_certs?: string[];
  official_url?: string;
  target_job_titles?: string[];
  exam_parts?: string[];
}

interface Job {
  id: number;
  title: string;
  company: string;
}

const INDUSTRY_LABELS: Record<string, string> = {
  cloud: 'Cloud',
  cybersecurity: 'Cybersecurity',
  data: 'Data',
  ai_ml: 'AI & ML',
  finance: 'Finance',
  marketing: 'Marketing',
  management: 'Management',
  business: 'Business & CRM',
  networking: 'Networking & Infra',
};

const INDUSTRY_ORDER = ['cloud', 'networking', 'cybersecurity', 'data', 'ai_ml', 'finance', 'marketing', 'management', 'business'];

function RoadmapContent() {
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get('jobId');

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'job-specific' | 'generic'>('job-specific');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(urlJobId || '');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Cert[]>([]);
  const [genericRoadmaps, setGenericRoadmaps] = useState<Record<string, Cert[]>>({});
  const [selectedIndustry, setSelectedIndustry] = useState<string>('cloud');
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleSearchQuery, setRoleSearchQuery] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  // Fetch roadmap data for a specific jobId or default
  const fetchRoadmapData = (jobId?: string) => {

    setLoading(true);
    setError(null);
    const url = jobId ? `/api/roadmap?jobId=${jobId}` : '/api/roadmap';

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          console.error('API Error:', result.error);
          setError(result.error);
        } else {
          setJobs(result.jobs || []);
          setSelectedJob(result.selectedJob || null);
          setRecommendations(result.recommendations || []);
          setGenericRoadmaps(result.genericRoadmaps || {});
          if (result.selectedJob) {
            setSelectedJobId(result.selectedJob.id.toString());
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load roadmap data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedJobId(val);
    fetchRoadmapData(val);
  };

  // 1. Flatten all certifications across all industries
  const allGenericCerts = useMemo(() => {
    return Object.values(genericRoadmaps).flat();
  }, [genericRoadmaps]);

  // 2. Get all unique job titles across all industries
  const roleJobTitles = useMemo(() => {
    const titles = new Set<string>();
    allGenericCerts.forEach(cert => {
      if (Array.isArray(cert.target_job_titles)) {
        cert.target_job_titles.forEach((title: string) => {
          if (title && title.trim()) {
            titles.add(title.trim());
          }
        });
      }
    });
    return Array.from(titles).sort();
  }, [allGenericCerts]);

  // No longer auto-selecting a job title by default.

  // Filter the dropdown list based on search query
  const filteredRoleTitles = useMemo(() => {
    if (!roleSearchQuery) return roleJobTitles.slice(0, 50); // limit to 50 for performance
    return roleJobTitles.filter(t => t.toLowerCase().includes(roleSearchQuery.toLowerCase())).slice(0, 50);
  }, [roleJobTitles, roleSearchQuery]);

  // 3. Filter certifications for the selected role title
  const roleCerts = useMemo(() => {
    if (!selectedRoleTitle) return [];
    const filtered = allGenericCerts.filter(cert =>
      Array.isArray(cert.target_job_titles) &&
      cert.target_job_titles.some((t: string) => t.trim().toLowerCase() === selectedRoleTitle.trim().toLowerCase())
    );
    // Deduplicate in case of cross-industry copies
    const unique = Array.from(new Map(filtered.map((c: any) => [c.id, c as Cert])).values()) as Cert[];
    return unique.sort((a: Cert, b: Cert) => a.difficulty - b.difficulty);
  }, [allGenericCerts, selectedRoleTitle]);

  const roleStage1 = useMemo(() => roleCerts.filter(c => c.difficulty <= 2), [roleCerts]);
  const roleStage2 = useMemo(() => roleCerts.filter(c => c.difficulty === 3), [roleCerts]);
  const roleStage3 = useMemo(() => roleCerts.filter(c => c.difficulty >= 4), [roleCerts]);

  if (loading && jobs.length === 0) {
    return (
      <div style={{
        maxWidth: 900,
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
          Loading your learning paths...
        </div>
      </div>
    );
  }

  if (error) {
    if (error === 'Unauthorized') {
      return (
        <div style={{
          maxWidth: 600,
          margin: '80px auto',
          padding: '40px 24px',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}>
          <Award size={48} style={{ color: 'var(--accent)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Unlock Your Career Roadmap
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 28px' }}>
            Sign in to analyze your saved jobs, generate customized certification pathways, track your certification progress, and map out your next career moves.
          </p>
          <a
            href="/sign-in?redirect_url=/roadmap"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Sign In / Register
          </a>
        </div>
      );
    }

    return (
      <div style={{
        maxWidth: 900,
        margin: '60px auto',
        padding: '0 24px',
        textAlign: 'center',
      }}>
        <div style={{ color: 'var(--error, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <AlertCircle size={24} />
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Error Loading Roadmap</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
        <button
          onClick={() => fetchRoadmapData()}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle empty state if user has no jobs analyzed/saved yet AND mode is job-specific
  const showEmptyJobs = mode === 'job-specific' && (jobs.length === 0 || !selectedJob);

  // Group recommendations into 3 career pathway stages for Job-Specific path
  const jobStage1 = recommendations.filter(r => r.difficulty <= 2);
  const jobStage2 = recommendations.filter(r => r.difficulty === 3);
  const jobStage3 = recommendations.filter(r => r.difficulty >= 4);

  // Group generic certifications by difficulty for chosen industry
  const genericCerts = genericRoadmaps[selectedIndustry] || [];
  genericCerts.sort((a, b) => a.difficulty - b.difficulty);
  const genericStage1 = genericCerts.filter(c => c.difficulty <= 2);
  const genericStage2 = genericCerts.filter(c => c.difficulty === 3);
  const genericStage3 = genericCerts.filter(c => c.difficulty >= 4);

  const filteredGenericCerts = genericCerts.filter(cert => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return cert.name.toLowerCase().includes(q) || cert.provider.toLowerCase().includes(q);
  });

  // Calculate unique skills covered by the roadmap vs total job skills (for job-specific mode)
  const jobSkills: string[] = selectedJob?.skills || [];
  const coveredSkills = Array.from(new Set(
    recommendations.flatMap(r => r.matchedSkills || []).map(s => s.toLowerCase())
  ));
  const uniqueCoveredSkills = jobSkills.filter(s => coveredSkills.includes(s.toLowerCase()));
  const totalSkillsCount = jobSkills.length;
  const coveredSkillsCount = uniqueCoveredSkills.length;
  const missingSkills = jobSkills.filter(s => !coveredSkills.includes(s.toLowerCase()));

  return (
    <div style={{
      maxWidth: 1000,
      margin: '0 auto',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        marginBottom: 36,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 28,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: 8,
            }}>
              My Certification Roadmap
            </h1>
            <p style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
            }}>
              {mode === 'job-specific'
                ? 'Your customized step-by-step pathways built dynamically based on your saved jobs and skill gaps.'
                : 'Find out what certifications are recommended next steps after completing a credential.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tab Bar */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card-hover, #f8fafc)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 4,
          alignSelf: 'flex-start',
          gap: 4,
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'job-specific', label: 'Job-Specific Path', icon: <Briefcase size={16} /> },
            { id: 'generic', label: 'Certification Path', icon: <Sparkles size={16} /> }
          ].map(tab => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Selector Dropdown */}
        {mode === 'job-specific' && !showEmptyJobs && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 480,
          }}>
            <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Select Target Job
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedJobId}
                onChange={handleJobChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} at {j.company}
                  </option>
                ))}
              </select>
              <div style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--text-secondary)',
              }}>
                ▼
              </div>
            </div>
          </div>
        )}

        {/* Industry and Role Selectors for Career/Explore Tracks */}
        {/* Industry Selectors for Certification Path */}
        {mode === 'generic' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {/* Industry Selector Tabs */}
            <div style={{
              display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <label style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Select Industry Domain
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {INDUSTRY_ORDER.map(ind => {
                    const active = selectedIndustry === ind;
                    return (
                      <button
                        key={ind}
                        onClick={() => setSelectedIndustry(ind)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          border: '1px solid var(--border)',
                          background: active ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                          color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          borderColor: active ? 'var(--accent-light)' : 'var(--border)',
                        }}
                      >
                        {INDUSTRY_LABELS[ind] || ind}
                      </button>
                    );
                  })}
                </div>
              </div>
          </div>
        )}
      </div>

      {/* JOB-SPECIFIC ROADMAP VIEW */}
      {mode === 'job-specific' && (
        showEmptyJobs ? (
          <div style={{
            maxWidth: 800,
            margin: '40px auto',
            padding: '40px 24px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            border: '1px solid var(--border)',
          }}>
            <Briefcase size={48} style={{ color: 'var(--text-secondary)', marginBottom: 16, opacity: 0.7 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              No Jobs Saved Yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto 24px' }}>
              We build customized certification pathways based on specific job listings. Go to the jobs page, add a job description, and we'll analyze it to map out your roadmap!
            </p>
            <a
              href="/jobs"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
            >
              Add a Job Posting
            </a>
          </div>
        ) : (
          <>
            {/* Pathway Summary Dashboard */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 40,
            }}>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Skill Coverage</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {totalSkillsCount > 0 ? Math.round((coveredSkillsCount / totalSkillsCount) * 100) : 0}%
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    ({coveredSkillsCount}/{totalSkillsCount} skills)
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{
                    width: `${totalSkillsCount > 0 ? (coveredSkillsCount / totalSkillsCount) * 100 : 0}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 3
                  }} />
                </div>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Completed / In Progress</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
                    {recommendations.filter(r => r.userStatus === 'completed').length}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>done</span>
                  <span style={{ fontSize: 20, fontWeight: 600, color: '#f59e0b', marginLeft: 8 }}>
                    {recommendations.filter(r => r.userStatus === 'in-progress').length}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>started</span>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Certifications Suggested</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {recommendations.length}
                </span>
              </div>
            </div>

            {/* Sequential Timeline Pathway */}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
              Sequenced Roadmap Steps
            </h2>

            {recommendations.length === 0 ? (
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)'
              }}>
                No recommended certifications map directly to this job description.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 32 }}>
                <div style={{
                  position: 'absolute',
                  left: 11,
                  top: 16,
                  bottom: 16,
                  width: 2,
                  background: 'linear-gradient(to bottom, var(--accent) 60%, var(--border))',
                }} />

                {/* DYNAMIC STAGES TIMELINE */}
                {[
                  {
                    title: "Foundational Credentials",
                    subtitle: "Build fundamental domain and tool familiarity",
                    certs: jobStage1
                  },
                  {
                    title: "Associate Certifications",
                    subtitle: "Demonstrate capability in standard frameworks and core tasks",
                    certs: jobStage2
                  },
                  {
                    title: "Advanced & Specialist Expertise",
                    subtitle: "Establish advanced authority, architectural competence, or direct alignment",
                    certs: jobStage3
                  }
                ]
                  .filter(stage => stage.certs.length > 0)
                  .map((stage, index) => (
                    <TimelineStage
                      key={index}
                      title={`Step ${index + 1}: ${stage.title}`}
                      subtitle={stage.subtitle}
                      stepNumber={(index + 1).toString()}
                      certs={stage.certs}
                    />
                  ))
                }
              </div>
            )}

            {/* Remaining Gaps */}
            {missingSkills.length > 0 && (
              <div style={{
                marginTop: 48,
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed var(--border)',
                borderRadius: 16,
                padding: 24,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  💡 Additional Skills Needed
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  These required skills are best verified through projects, experience, or specialized study rather than standard certifications:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {missingSkills.map((skill, index) => (
                    <span key={index} style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* CERTIFICATION PATH MODE */}
      {mode === 'generic' && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {INDUSTRY_LABELS[selectedIndustry] || selectedIndustry} Path Guides
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Explore what credentials to take next to progressively build your expertise.
          </p>

          {/* Search Input for Generic Path */}
          <div style={{ marginBottom: 24, maxWidth: 480 }}>
            <input
              type="text"
              placeholder="Search for a completed certification (e.g., Cloud Practitioner, CCNA, PL-300)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {genericCerts.length === 0 ? (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}>
              No certifications categorized in this domain.
            </div>
          ) : filteredGenericCerts.length === 0 ? (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}>
              No matching certifications found for "{searchQuery}".
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {filteredGenericCerts.map((cert: Cert) => {
                const nextList = cert.next_certs || [];
                if (nextList.length === 0) return null;

                return (
                  <div
                    key={`generic-${cert.id}`}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: 12,
                    }}>
                      After {cert.name}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {nextList.map((nextName: string, idx: number) => {
                        return (
                          <div
                            key={`${cert.id}-next-${idx}`}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: 8,
                              padding: 12,
                              border: '1px solid var(--border)',
                            }}
                          >
                            <div style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              marginBottom: 4,
                            }}>
                              {nextName}
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                            }}>
                              Recommended Next Step
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Stage grouping component
function TimelineStage({
  title,
  subtitle,
  stepNumber,
  certs
}: {
  title: string;
  subtitle: string;
  stepNumber: string;
  certs: Cert[]
}) {
  return (
    <div style={{ marginBottom: 44, position: 'relative' }}>
      {/* Node Indicator */}
      <div style={{
        position: 'absolute',
        left: -32,
        top: 2,
        transform: 'translateX(-50%)',
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--accent)',
        border: '4px solid var(--bg-primary, #0c0a09)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{stepNumber}</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {certs.map(cert => (
          <CertCard key={cert.id} cert={cert} />
        ))}
      </div>
    </div>
  );
}

// Interactive Certification Card
function CertCard({ cert }: { cert: Cert }) {
  const [showAlts, setShowAlts] = useState(false);
  const [checkedParts, setCheckedParts] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(!!cert.userStatus);
  const [isHydrated, setIsHydrated] = useState(false);

  const storageKey = `cert_parts_${cert.id}`;

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCheckedParts(JSON.parse(stored));
      } else {
        setCheckedParts([]);
      }
    } catch { }
  };

  useEffect(() => {
    loadProgress();
    setIsHydrated(true);

    const handleUpdate = () => {
      loadProgress();
    };
    window.addEventListener('exam-parts-updated', handleUpdate);
    return () => {
      window.removeEventListener('exam-parts-updated', handleUpdate);
    };
  }, [storageKey]);

  useEffect(() => {
    setIsSaved(!!cert.userStatus);
  }, [cert.userStatus]);

  useEffect(() => {
    const handleUserCertsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.certId === cert.id) {
        setIsSaved(!!customEvent.detail.status);
      }
    };
    window.addEventListener('user-certs-updated', handleUserCertsUpdate as EventListener);
    return () => {
      window.removeEventListener('user-certs-updated', handleUserCertsUpdate as EventListener);
    };
  }, [cert.id]);

  const togglePart = (part: string) => {
    if (!isSaved) return;
    let updated: string[];
    if (checkedParts.includes(part)) {
      updated = checkedParts.filter((p) => p !== part);
    } else {
      updated = [...checkedParts, part];
    }
    setCheckedParts(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('exam-parts-updated'));
    } catch { }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}><CheckCircle size={14} /> Completed</span>;
      case 'in-progress':
        return <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}><Clock size={14} /> In Progress</span>;
      case 'interested':
        return <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}><Award size={14} /> Interested</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 14,
      border: '1px solid var(--border)',
      padding: 20,
      transition: 'transform 0.15s, border-color 0.15s',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Title and Provider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {cert.name}
            </h4>
            {getStatusBadge(cert.userStatus)}
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: cert.providerColor || 'var(--text-secondary)',
            letterSpacing: '0.025em'
          }}>
            {cert.provider} • Difficulty {cert.difficulty}/5
          </span>
        </div>

        {/* Score Match Pill (only if there is a match score, e.g. in Job-Specific mode) */}
        {cert.score !== undefined && cert.score > 0 && (
          <div style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent-light)',
            padding: '6px 12px',
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            {cert.score}% Fit
          </div>
        )}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
        {cert.explanation || cert.description}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <AddCertButton certId={cert.id} certName={cert.name} small />
        <Link
          href={`/certifications/${getSlug(cert.name)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            border: '1px solid var(--border)',
            background: 'transparent',
            padding: '6px 14px',
            borderRadius: 8,
            transition: 'all 0.2s',
          }}
          className="hover:bg-opacity-10 hover:bg-white"
        >
          View Details
        </Link>
        {cert.official_url && (
          <a
            href={cert.official_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
              background: 'transparent',
              padding: '6px 14px',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--border-light)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Official Website ↗
          </a>
        )}
      </div>

      {/* Exam Parts progress inside roadmap timeline */}
      {cert.exam_parts && cert.exam_parts.length > 0 && (
        <div style={{
          marginTop: 16,
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 16,
        }}>
          {(() => {
            const normalizedParts = cert.exam_parts.map((part: any) => {
              if (typeof part === 'string') {
                return { name: part, description: '' };
              }
              if (part && typeof part === 'object' && part.name) {
                return { name: part.name, description: part.description || '' };
              }
              return { name: String(part), description: '' };
            });

            const totalParts = normalizedParts.length;
            const completedParts = isHydrated && isSaved ? checkedParts.filter((p) => normalizedParts.some(np => np.name === p)).length : 0;

            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {isSaved ? 'Exam Progress' : 'Exam Sections'}
                  </span>
                  {isHydrated && isSaved && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: completedParts === totalParts ? '#10b981' : 'var(--accent-light)' }}>
                      {completedParts}/{totalParts} Parts Passed
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {normalizedParts.map(part => {
                    const isChecked = isSaved && checkedParts.includes(part.name);

                    if (!isSaved) {
                      // Read-only style (not saved)
                      return (
                        <div
                          key={part.name}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: '8px 10px',
                            background: 'transparent',
                            border: '1px dashed var(--border-light)',
                            borderRadius: 8,
                            opacity: 0.85,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
                            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>•</span>
                            </div>
                            <span>{part.name}</span>
                          </div>
                          {part.description && (
                            <p style={{ margin: '2px 0 0 22px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {part.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // Interactive button style (is saved)
                    return (
                      <button
                        key={part.name}
                        onClick={() => togglePart(part.name)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          width: '100%',
                          padding: '8px 10px',
                          background: isChecked ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                          border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                          {isHydrated && isChecked ? (
                            <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }} />
                          )}
                          <span>{part.name}</span>
                        </div>
                        {part.description && (
                          <p style={{ margin: '2px 0 0 26px', fontSize: 11, color: isChecked ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.3, opacity: 0.85 }}>
                            {part.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Matched Skills Chips */}
      {cert.matchedSkills && cert.matchedSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {cert.matchedSkills.map((skill, index) => (
            <span key={index} style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent-light)',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 6,
              opacity: 0.95
            }}>
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Alternative Paths Expander */}
      {cert.alternatives && cert.alternatives.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 14 }}>
          <button
            onClick={() => setShowAlts(!showAlts)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 0,
            }}
          >
            <ChevronRight size={14} style={{ transform: showAlts ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            {showAlts ? 'Hide' : 'Show'} Alternative Options ({cert.alternatives.length})
          </button>

          {showAlts && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
              marginTop: 12,
            }}>
              {cert.alternatives.map((alt: any) => (
                <div key={alt.id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 10,
                  padding: 12,
                  border: `1px solid ${alt.providerColor || 'var(--border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {alt.name}
                  </span>
                  <div style={{ display: 'flex', justifySelf: 'flex-end', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>{alt.provider}</span>
                    <span>Lvl {alt.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>Loading roadmap...</div>}>
      <RoadmapContent />
    </Suspense>
  );
}
