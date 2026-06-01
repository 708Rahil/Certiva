'use client';

import { useEffect, useState } from 'react';
import RoadmapFlowchart from '@/components/RoadmapFlowchart';

interface Cert {
  id: number;
  name: string;
  difficulty: number;
  prerequisites: string[];
  userStatus?: string;
  provider?: string;
  providerColor?: string;
  alternatives?: Cert[];
}

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/roadmap')
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          console.error('API Error:', result);
          setLoading(false);
          return;
        }
        setData(result);
        const industries = Object.keys(result.byIndustry || {});
        setSelectedIndustry(industries[0] || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load roadmap:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Loading your learning paths...
        </div>
      </div>
    );
  }

  if (!data || !data.byIndustry) {
    return (
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Failed to load roadmap
        </div>
      </div>
    );
  }

  const industries = Object.keys(data.byIndustry).sort();
  const currentCerts = selectedIndustry ? (data.byIndustry[selectedIndustry] || []) : [];

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Certification Roadmap
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
        }}>
          Explore learning paths and prerequisite chains. Dashed arrows show dependencies.
        </p>
      </div>

      {/* Industry selector */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 32,
        overflow: 'auto',
        paddingBottom: 8,
      }}>
        {industries.map(industry => (
          <button
            key={industry}
            onClick={() => setSelectedIndustry(industry)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: selectedIndustry === industry ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: selectedIndustry === industry ? 'var(--accent-dim)' : 'transparent',
              color: selectedIndustry === industry ? 'var(--accent-light)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {industry}
            <span style={{
              marginLeft: 6,
              fontSize: 12,
              opacity: 0.7,
            }}>
              ({data.byIndustry[industry].length})
            </span>
          </button>
        ))}
      </div>

      {/* Flowchart */}
      {currentCerts.length > 0 ? (
        <RoadmapFlowchart certs={currentCerts} />
      ) : (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          No certifications in this industry
        </div>
      )}

      {/* Alternative Paths Section */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 16,
        }}>
          Alternative Learning Paths
        </h2>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginBottom: 24,
        }}>
          Explore certifications from other providers at similar levels. These alternatives can complement or diversify your skills.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {currentCerts.map((cert: Cert) => {
            if (!cert.alternatives || cert.alternatives.length === 0) return null;

            return (
              <div
                key={`alt-${cert.id}`}
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
                  {cert.alternatives.map((alt: any) => (
                    <div
                      key={alt.id}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 8,
                        padding: 12,
                        border: `1px solid ${alt.providerColor || 'var(--border)'}`,
                        opacity: alt.userStatus === 'completed' ? 0.6 : 1,
                      }}
                    >
                      <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                      }}>
                        {alt.name}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{
                          background: (alt.providerColor || 'var(--text-secondary)') + '20',
                          padding: '2px 6px',
                          borderRadius: 4,
                          color: alt.providerColor || 'var(--text-secondary)',
                          fontWeight: 500,
                        }}>
                          {alt.provider}
                        </span>
                        <span>Level {alt.difficulty}</span>
                        {alt.userStatus && (
                          <span style={{ color: alt.userStatus === 'completed' ? '#10b981' : '#3b82f6' }}>
                            {alt.userStatus === 'completed' ? '✓ Done' : '★ Interested'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {currentCerts.filter((c: Cert) => c.alternatives && c.alternatives.length > 0).length === 0 && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}>
            No alternative paths available yet for this industry
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginTop: 32,
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Total Certifications
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentCerts.length}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Completed
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
            {currentCerts.filter((c: Cert) => c.userStatus === 'completed').length}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            In Progress
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
            {currentCerts.filter((c: Cert) => c.userStatus === 'in-progress').length}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Interested
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
            {currentCerts.filter((c: Cert) => c.userStatus === 'interested').length}
          </div>
        </div>
      </div>
    </div>
  );
}
