'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSlug } from '@/lib/slug';
import ScoreRing from './ScoreRing';

interface CertCardProps {
  rank: number;
  certId?: number;
  name: string;
  provider: string;
  industry: string;
  difficulty: number;
  score: number;
  skillOverlap: number;
  industryMatch: boolean;
  matchedSkills: string[];
  explanation: string;
  description: string;
  cost?: string;
  duration?: string;
  official_url?: string;
  onAddToCerts?: (certId: number, certName: string) => Promise<void>;
  animDelay?: number;
  exam_parts?: any[];
}

const INDUSTRY_COLORS: Record<string, string> = {
  cloud: '#2563eb',
  data: '#34d399',
  cybersecurity: '#f87171',
  finance: '#fbbf24',
  marketing: '#a78bfa',
  management: '#38bdf8',
  general: '#94a3b8',
};

const DIFFICULTY_LABELS = ['', 'Beginner', 'Beginner+', 'Intermediate', 'Advanced', 'Expert'];

export default function CertCard({
  rank, certId, name, provider, industry, difficulty, score,
  matchedSkills, explanation, description, cost, duration, official_url, onAddToCerts, animDelay = 0,
  exam_parts
}: CertCardProps) {
  const [adding, setAdding] = useState(false);
  const industryColor = INDUSTRY_COLORS[industry] || '#94a3b8';

  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${animDelay}ms`,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)';
      }}
    >
      {/* Rank */}
      <div style={{
        width: 32, height: 32, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: rank <= 3 ? industryColor : 'var(--text-muted)',
        background: rank <= 3 ? `${industryColor}18` : 'var(--border)',
        borderRadius: 8,
        marginTop: 4,
      }}>
        #{rank}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                {name}
              </h3>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em',
                background: `${industryColor}20`, color: industryColor,
              }}>
                {industry}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{provider}</div>
          </div>

          <ScoreRing score={score} size={64} />
        </div>

        {/* Description */}
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {description}
        </p>

        {/* Explanation */}
        <div style={{
          background: 'rgba(79,110,247,0.07)',
          border: '1px solid rgba(79,110,247,0.15)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 12,
          fontSize: 13,
          color: '#a5b4fc',
          lineHeight: 1.5,
        }}>
          {explanation}
        </div>

        {/* Exam Sections (only if multiple sections exist) */}
        {(() => {
          const normalizedParts = (exam_parts || []).map((part: any): { name: string; description: string } => {
            if (typeof part === 'string') {
              return { name: part, description: '' };
            }
            if (part && typeof part === 'object' && part.name) {
              return { name: part.name, description: part.description || '' };
            }
            return { name: String(part), description: '' };
          });

          if (normalizedParts.length <= 1) return null;

          return (
            <div style={{
              marginTop: 12,
              marginBottom: 16,
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                📚 Exam Sections
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {normalizedParts.map(part => (
                  <div key={part.name} style={{
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{part.name}</div>
                    {part.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {part.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Matched skills */}
        {matchedSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {matchedSkills.slice(0, 6).map(skill => (
              <span key={skill} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px',
                borderRadius: 100,
                background: 'rgba(52,211,153,0.12)',
                color: '#34d399',
                letterSpacing: '0.02em',
              }}>
                ✓ {skill}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <MetaItem
              label="Difficulty"
              value={DIFFICULTY_LABELS[difficulty] || `Level ${difficulty}`}
              dots={difficulty}
            />
            {cost && <MetaItem label="Cost" value={cost} />}
            {duration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MetaItem label="Timeline" value={duration} />
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {certId && (
              <Link
                href={`/certifications/${getSlug(name)}`}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                  whiteSpace: 'nowrap',
                }}
                className="hover:opacity-90"
              >
                View Details
              </Link>
            )}
            {official_url && (
              <a
                href={official_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                className="hover:bg-[var(--border)] hover:text-white"
              >
                Official Website ↗
              </a>
            )}
            {certId && onAddToCerts && (
              <button
                onClick={async () => {
                  setAdding(true);
                  try {
                    await onAddToCerts(certId, name);
                  } finally {
                    setAdding(false);
                  }
                }}
                disabled={adding}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--accent)',
                  background: 'transparent',
                  color: 'var(--accent-light)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: adding ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: adding ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!adding) {
                    e.currentTarget.style.background = 'var(--accent-dim)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {adding ? 'Adding...' : '+ Add to My Certs'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, dots }: { label: string; value: string; dots?: number }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {dots && (
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: i <= dots ? '#fbbf24' : 'var(--border-light)',
              }} />
            ))}
          </div>
        )}
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{value}</span>
      </div>
    </div>
  );
}
