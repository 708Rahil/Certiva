'use client';

import { useState } from 'react';

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
  const statusInfo = statusColors[cert.status] || statusColors.interested;

  const handleStatusChange = (newStatus: string) => {
    onUpdate(cert.id, newStatus);
  };

  const handleDelete = async () => {
    if (!confirm('Remove this certification from your list?')) return;
    setIsDeleting(true);
    await onDelete(cert.id);
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 20,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 20,
      alignItems: 'start',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {cert.name}
          </h3>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {cert.provider}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
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

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pass Rate: </span>
            <span style={{ color: 'var(--text-primary)' }}>{cert.pass_rate_percent}%</span>
          </div>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Salary Boost: </span>
            <span style={{ color: 'var(--green)' }}>+${cert.salary_boost_low.toLocaleString()}–${cert.salary_boost_high.toLocaleString()}</span>
          </div>
        </div>

        {cert.notes && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Notes: {cert.notes}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 150 }}>
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
              color: 'var(--accent-light)',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-dim)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            View Details
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
