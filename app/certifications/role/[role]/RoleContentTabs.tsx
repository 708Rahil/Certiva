'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Award, Map, ChevronRight, TrendingUp, Filter, ArrowUpDown } from 'lucide-react';
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
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});

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

  // Filter & Sort Recommended Certs
  const filteredAndSortedCerts = useMemo(() => {
    let result = [...certs];

    // Difficulty Filter
    if (difficultyFilter !== 'all') {
      if (difficultyFilter === 'beginner') {
        result = result.filter(c => c.difficulty <= 2);
      } else if (difficultyFilter === 'intermediate') {
        result = result.filter(c => c.difficulty === 3);
      } else if (difficultyFilter === 'advanced') {
        result = result.filter(c => c.difficulty >= 4);
      }
    }

    // Cost Filter
    if (costFilter !== 'all') {
      result = result.filter(c => {
        const costStr = (c.cost || '').toLowerCase();
        if (costStr.includes('free')) {
          return true; // show free in any cost filter
        }
        const priceNum = Number(costStr.replace(/[^0-9]/g, ''));
        if (isNaN(priceNum) || priceNum === 0) return true;
        if (costFilter === 'free-100') return priceNum <= 100;
        if (costFilter === 'under-300') return priceNum <= 300;
        if (costFilter === 'under-500') return priceNum <= 500;
        return true;
      });
    }

    // Sort Options
    if (sortOption === 'salary') {
      result.sort((a, b) => b.salary_boost_low - a.salary_boost_low);
    } else if (sortOption === 'difficulty-asc') {
      result.sort((a, b) => a.difficulty - b.difficulty);
    } else if (sortOption === 'difficulty-desc') {
      result.sort((a, b) => b.difficulty - a.difficulty);
    }

    return result;
  }, [certs, difficultyFilter, costFilter, sortOption]);

  // Group into stages for the visual roadmap (using original certs list, sorted by rating/boost for main views)
  const roadmapCerts = useMemo(() => {
    return [...certs].sort((a, b) => {
      // Sort by salary boost descending, then difficulty ascending
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      return b.salary_boost_low - a.salary_boost_low;
    });
  }, [certs]);

  const stage1 = useMemo(() => roadmapCerts.filter(c => c.difficulty <= 2), [roadmapCerts]);
  const stage2 = useMemo(() => roadmapCerts.filter(c => c.difficulty === 3), [roadmapCerts]);
  const stage3 = useMemo(() => roadmapCerts.filter(c => c.difficulty >= 4), [roadmapCerts]);

  const toggleStage = (index: number) => {
    setExpandedStages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const [activeTab, setActiveTab] = useState<'roadmap' | 'certs'>('roadmap');

  return (
    <div>
      {/* Tabs Controller */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 4,
        border: '1px solid var(--border)',
        marginBottom: 32,
        maxWidth: 400,
      }}>
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
          Step-by-Step Roadmap
        </button>
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
          All Recommended Certs
        </button>
      </div>

      {/* Role Roadmap View */}
      <div style={{ marginBottom: 64, display: activeTab === 'roadmap' ? 'block' : 'none' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
          {roleName} Step-by-Step Roadmap
        </h2>
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
            .map((stage, index) => {
              const mainCerts = stage.certs.slice(0, 2); // Show top 2 certs
              const altCerts = stage.certs.slice(2); // Hide others as alternatives
              const isExpanded = !!expandedStages[index];

              return (
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

                  {/* Main Cards List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {mainCerts.map(c => (
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
                    ))}
                  </div>

                  {/* Alternatives Expander */}
                  {altCerts.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <button
                        onClick={() => toggleStage(index)}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 8,
                          transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        {isExpanded ? 'Hide' : 'Show'} Alternative Options ({altCerts.length})
                      </button>

                      {isExpanded && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                          gap: 12,
                          marginTop: 12,
                          paddingLeft: 12,
                          borderLeft: '2px solid var(--border)',
                        }}>
                          {altCerts.map(c => (
                            <div
                              key={c.id}
                              style={{
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                                padding: 14,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: 8,
                              }}
                            >
                              <div>
                                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                                  {c.name}
                                </h5>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                  {c.provider} • Lvl {c.difficulty}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                <AddCertButton certId={c.id} certName={c.name} small />
                                <Link
                                  href={`/certifications/${getSlug(c.name)}`}
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    border: '1px solid var(--border)',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                  }}
                                >
                                  Details
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Recommended Certs View */}
      <div style={{ display: activeTab === 'certs' ? 'block' : 'none' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
          All Recommended {roleName} Certifications
        </h2>
          {/* Filters Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Filter size={15} /> Filters:
            </div>
            
            {/* Difficulty Selector */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner (Lvl 1-2)</option>
              <option value="intermediate">Intermediate (Lvl 3)</option>
              <option value="advanced">Advanced/Expert (Lvl 4-5)</option>
            </select>

            {/* Cost Selector */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Costs</option>
              <option value="free-100">Free & Under $100</option>
              <option value="under-300">Under $300</option>
              <option value="under-500">Under $500</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              <ArrowUpDown size={15} /> Sort:
            </div>

            {/* Sort Selector */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="default">Default Match</option>
              <option value="salary">Highest Salary Boost</option>
              <option value="difficulty-asc">Difficulty: Low to High</option>
              <option value="difficulty-desc">Difficulty: High to Low</option>
            </select>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredAndSortedCerts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 24px',
                background: 'var(--bg-secondary)',
                borderRadius: 16,
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}>
                No certifications match your selected filters.
              </div>
            ) : (
              filteredAndSortedCerts.map((cert) => {
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
              })
            )}
          </div>
        </div>
    </div>
  );
}
