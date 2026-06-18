'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, Map, ChevronRight, TrendingUp } from 'lucide-react';
import AddCertButton from '@/components/AddCertButton';
import { getSlug } from '@/lib/slug';

interface Cert {
  id: number;
  name: string;
  provider: string;
  industry: string;
  difficulty: number;
  description: string;
  skills: any;
  cost?: string;
  duration_weeks?: number;
  salary_boost_low: number;
}

interface RoleContentTabsProps {
  certs: Cert[];
  roleName: string;
  INDUSTRY_COLORS: Record<string, string>;
  DIFFICULTY_LABELS: string[];
}

export default function RoleContentTabs({
  certs,
  roleName,
  INDUSTRY_COLORS,
  DIFFICULTY_LABELS,
}: RoleContentTabsProps) {
  const [activeTab, setActiveTab] = useState<'certs' | 'roadmap'>('certs');

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

  // Group into stages for the visual roadmap
  const sortedCerts = [...certs].sort((a, b) => a.difficulty - b.difficulty);
  const stage1 = sortedCerts.filter(c => c.difficulty <= 2);
  const stage2 = sortedCerts.filter(c => c.difficulty === 3);
  const stage3 = sortedCerts.filter(c => c.difficulty >= 4);

  return (
    <div>
      {/* Tabs Controller */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 4,
        border: '1px solid var(--border)',
        marginBottom: 36,
        maxWidth: 400,
      }}>
        <button
          onClick={() => setActiveTab('certs')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'certs' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'certs' ? '#fff' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Award size={16} />
          Recommended Certs
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'roadmap' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'roadmap' ? '#fff' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Map size={16} />
          Career Roadmap
        </button>
      </div>

      {/* Recommended Certs View */}
      {activeTab === 'certs' && (
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
      )}

      {/* Role Roadmap View */}
      {activeTab === 'roadmap' && (
        <div>
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
                title: "Foundational Credentials",
                subtitle: "Build fundamental domain and tool familiarity",
                certs: stage1
              },
              {
                title: "Associate Certifications",
                subtitle: "Demonstrate capability in standard frameworks and core tasks",
                certs: stage2
              },
              {
                title: "Advanced & Specialist Expertise",
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
                      Step {index + 1}: {stage.title}
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
      )}
    </div>
  );
}
