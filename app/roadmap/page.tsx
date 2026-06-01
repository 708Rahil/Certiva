'use client';

import { useEffect, useState } from 'react';
import RoadmapFlowchart from '@/components/RoadmapFlowchart';

interface Cert {
  id: number;
  name: string;
  difficulty: number;
  prerequisites: string[];
  userStatus?: string;
}

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/roadmap')
      .then(res => res.json())
      .then(result => {
        setData(result);
        const industries = Object.keys(result.byIndustry);
        setSelectedIndustry(industries[0]);
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

  if (!data) {
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
