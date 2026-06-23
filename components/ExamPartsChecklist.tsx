'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface ExamPartsChecklistProps {
  certId: number;
  certName: string;
  examParts: string[];
}

export default function ExamPartsChecklist({ certId, certName, examParts }: ExamPartsChecklistProps) {
  const { userId, isLoaded } = useAuth();
  const [checkedParts, setCheckedParts] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const storageKey = `cert_parts_${certId}`;

  // Load checked parts and initial saved status
  useEffect(() => {
    const initStatus = async () => {
      // Load progress
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setCheckedParts(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error reading localStorage for exam parts:', e);
      }

      // Check if saved
      if (userId) {
        try {
          const res = await fetch('/api/user-certifications');
          if (res.ok) {
            const certs = await res.json();
            const found = certs.some((c: any) => c.cert_id === certId);
            setIsSaved(found);
          }
        } catch (e) {
          console.error('Error checking saved status:', e);
        }
      }
      setIsHydrated(true);
    };

    initStatus();
  }, [storageKey, userId]);

  // Listen to status updates from AddCertButton or other components
  useEffect(() => {
    const handleCertsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.certId === certId) {
        setIsSaved(!!customEvent.detail.status);
      }
    };

    window.addEventListener('user-certs-updated', handleCertsUpdate as EventListener);
    return () => {
      window.removeEventListener('user-certs-updated', handleCertsUpdate as EventListener);
    };
  }, [certId]);

  // Toggle a checklist item (only allowed if saved)
  const handleToggle = (part: string) => {
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
    } catch (e) {
      console.error('Error writing to localStorage for exam parts:', e);
    }
  };

  if (!examParts || examParts.length === 0) return null;

  const totalParts = examParts.length;
  const completedParts = isHydrated && isSaved ? checkedParts.filter((p) => examParts.includes(p)).length : 0;
  const percentCompleted = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
      marginTop: 32,
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: isSaved ? 16 : 20, 
        borderBottom: '1px solid var(--border)', 
        paddingBottom: 12 
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          {isSaved ? 'Exam Progress' : 'Exam Sections'}
        </h2>
        {isHydrated && isSaved && (
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

      {/* Progress Bar (Only visible when saved) */}
      {isSaved && (
        <div style={{ width: '100%', height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{
            width: `${percentCompleted}%`,
            height: '100%',
            background: percentCompleted === 100 ? '#10b981' : 'var(--accent)',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      {/* Parts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {examParts.map((part) => {
          const isChecked = isSaved && checkedParts.includes(part);
          
          if (!isSaved) {
            // Read-only style (not added to certifications yet)
            return (
              <div
                key={part}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 12,
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                <Lock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ lineHeight: 1.4 }}>{part}</span>
              </div>
            );
          }

          // Interactive button style (is saved)
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

      {/* Helpful Hint for Unsaved State */}
      {!isSaved && (
        <div style={{
          marginTop: 18,
          fontSize: 13,
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border)',
          borderRadius: 10,
          padding: '12px 14px',
          textAlign: 'center',
        }}>
          💡 Click <strong>Add Certification</strong> above to enable tracking your progress for these exam sections.
        </div>
      )}
    </div>
  );
}
