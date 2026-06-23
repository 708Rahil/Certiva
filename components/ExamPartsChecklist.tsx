'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ExamPartsChecklistProps {
  certId: number;
  certName: string;
  examParts: string[];
}

export default function ExamPartsChecklist({ certId, certName, examParts }: ExamPartsChecklistProps) {
  const [checkedParts, setCheckedParts] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Storage key: cert_parts_${certId}
  const storageKey = `cert_parts_${certId}`;

  // Hydrate checked parts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCheckedParts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading localStorage for exam parts:', e);
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Toggle a checklist item
  const handleToggle = (part: string) => {
    let updated: string[];
    if (checkedParts.includes(part)) {
      updated = checkedParts.filter((p) => p !== part);
    } else {
      updated = [...checkedParts, part];
    }
    setCheckedParts(updated);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      // Dispatch a custom event to update other components (like Roadmap page) in real-time
      window.dispatchEvent(new Event('exam-parts-updated'));
    } catch (e) {
      console.error('Error writing to localStorage for exam parts:', e);
    }
  };

  if (!examParts || examParts.length === 0) return null;

  const totalParts = examParts.length;
  const completedParts = isHydrated ? checkedParts.filter((p) => examParts.includes(p)).length : 0;
  const percentCompleted = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
      marginTop: 32,
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          Exam Sections & Progress
        </h2>
        {isHydrated && (
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: percentCompleted === 100 ? '#10b981' : 'var(--accent-light)',
            background: percentCompleted === 100 ? 'rgba(16, 185, 129, 0.08)' : 'var(--accent-dim)',
            padding: '4px 10px',
            borderRadius: 8,
          }}>
            {completedParts} / {totalParts} Parts Passed ({percentCompleted}%)
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{
          width: `${percentCompleted}%`,
          height: '100%',
          background: percentCompleted === 100 ? '#10b981' : 'var(--accent)',
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Checklist items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {examParts.map((part) => {
          const isChecked = checkedParts.includes(part);
          return (
            <button
              key={part}
              onClick={() => handleToggle(part)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '14px 16px',
                background: isChecked ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg)',
                border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseOut={(e) => {
                if (!isChecked) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
            >
              {isHydrated && isChecked ? (
                <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              ) : (
                <Circle size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              )}
              <span style={{ lineHeight: 1.4 }}>{part}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
