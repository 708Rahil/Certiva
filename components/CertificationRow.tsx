'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSlug } from '@/lib/slug';
import { CheckCircle, Circle } from 'lucide-react';

interface UserCertification {
  id: number;
  cert_id: number;
  name: string;
  provider: string;
  industry: string;
  difficulty: number;
  status: 'interested' | 'in-progress' | 'completed';
  started_date?: string;
  completed_date?: string;
  notes?: string;
  cost: string;
  duration_weeks: number;
  pass_rate_percent: number;
  official_url?: string;
  salary_boost_low: number;
  salary_boost_high: number;
  trending: number;
  exam_parts?: string[];
}

interface CertificationRowProps {
  cert: UserCertification;
  onUpdate: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  'interested': { bg: 'rgba(79, 110, 247, 0.15)', text: '#6b85f9', label: 'Interested' },
  'in-progress': { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', label: 'In Progress' },
  'completed': { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', label: 'Completed' },
};

export default function CertificationRow({ cert, onUpdate, onDelete }: CertificationRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkedParts, setCheckedParts] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const statusInfo = statusColors[cert.status] || statusColors.interested;

  const storageKey = `cert_parts_${cert.cert_id}`;

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCheckedParts(JSON.parse(stored));
      } else {
        setCheckedParts([]);
      }
    } catch {}
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

  const togglePart = (part: string) => {
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
    } catch {}
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdate(cert.id, newStatus);
  };

  const handleDelete = async () => {
    if (!confirm('Remove this certification from your list?')) return;
    setIsDeleting(true);
    await onDelete(cert.id);
  };

  return (
    <div className="cert-row-container">
      <div>
        <div className="cert-row-title-container">
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {cert.name}
          </h3>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {cert.provider}
          </span>
        </div>

        <div className="cert-row-meta">
          <span>{cert.industry}</span>
          <span>•</span>
          <span>Difficulty: {cert.difficulty}/5</span>
          <span>•</span>
          <span>{cert.duration_weeks} weeks</span>
          {cert.trending === 1 && (
            <>
              <span>•</span>
              <span style={{ color: 'var(--green)' }}>🔥 Trending</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pass Rate: </span>
            <span style={{ color: 'var(--text-primary)' }}>{cert.pass_rate_percent}%</span>
          </div>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Salary Boost: </span>
            <span style={{ color: 'var(--green)' }}>+${cert.salary_boost_low.toLocaleString()}–${cert.salary_boost_high.toLocaleString()}</span>
          </div>
        </div>

        {cert.exam_parts && cert.exam_parts.length > 0 && (
          <div style={{
            marginTop: 8,
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 14px',
            maxWidth: 500,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Exam Progress</span>
              {isHydrated && (
                <span style={{ fontSize: 11, fontWeight: 600, color: checkedParts.length === cert.exam_parts.length ? '#10b981' : 'var(--accent-light)' }}>
                  {checkedParts.filter(p => cert.exam_parts!.includes(p)).length}/{cert.exam_parts.length} Parts Passed
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cert.exam_parts.map(part => {
                const isChecked = checkedParts.includes(part);
                return (
                  <button
                    key={part}
                    onClick={() => togglePart(part)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '6px 10px',
                      background: isChecked ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isHydrated && isChecked ? (
                      <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }} />
                    )}
                    <span>{part}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {cert.notes && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Notes: {cert.notes}
          </div>
        )}
      </div>

      <div className="cert-row-actions">
        <select
          value={cert.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${statusInfo.text}`,
            background: statusInfo.bg,
            color: statusInfo.text,
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <option value="interested">Interested</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <Link
          href={`/certifications/${getSlug(cert.name)}`}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#fff',
            textDecoration: 'none',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 500,
            transition: 'opacity 0.15s',
            cursor: 'pointer',
          }}
          className="hover:opacity-90"
        >
          View Details
        </Link>

        {cert.official_url && (
          <a
            href={cert.official_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border-light)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Official Website ↗
          </a>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--red)',
            background: 'transparent',
            color: 'var(--red)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            opacity: isDeleting ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isDeleting ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
