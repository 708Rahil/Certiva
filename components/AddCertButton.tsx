'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Plus, Check, Loader2, ChevronDown, Trash2, Bookmark } from 'lucide-react';

interface UserCertification {
  id: number;
  cert_id: number;
  status: 'interested' | 'in-progress' | 'completed';
}

interface AddCertButtonProps {
  certId: number;
  certName: string;
  small?: boolean;
}

export default function AddCertButton({ certId, certName, small = false }: AddCertButtonProps) {
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [userCert, setUserCert] = useState<UserCertification | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user's certifications to see if this one is already added
  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      setInitLoading(false);
      return;
    }

    const checkCertStatus = async () => {
      try {
        const res = await fetch('/api/user-certifications');
        if (res.ok) {
          const certs: UserCertification[] = await res.ok ? await res.json() : [];
          const found = certs.find(c => c.cert_id === certId);
          setUserCert(found || null);
        }
      } catch (err) {
        console.error('Failed to fetch user certifications status:', err);
      } finally {
        setInitLoading(false);
      }
    };

    checkCertStatus();
  }, [isLoaded, userId, certId]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = async (status: 'interested' | 'in-progress' | 'completed') => {
    if (!userId) {
      // Redirect to sign in page
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setLoading(true);
    setDropdownOpen(false);
    try {
      const response = await fetch('/api/user-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId,
          status,
          startedDate: status === 'in-progress' ? new Date().toISOString().split('T')[0] : null,
          completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : null,
          notes: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update certification');

      // Refresh status locally
      const res = await fetch('/api/user-certifications');
      if (res.ok) {
        const certs: UserCertification[] = await res.json();
        const found = certs.find(c => c.cert_id === certId);
        setUserCert(found || null);
      }
    } catch (err) {
      console.error('Error updating certification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!userCert) return;

    setLoading(true);
    setDropdownOpen(false);
    try {
      const response = await fetch(`/api/user-certifications/${userCert.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove certification');
      setUserCert(null);
    } catch (err) {
      console.error('Error removing certification:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: small ? '6px 12px' : '10px 20px',
        borderRadius: 8,
        background: 'var(--border)',
        opacity: 0.7,
        height: small ? 32 : 44,
        width: small ? 110 : 160,
      }}>
        <Loader2 size={small ? 14 : 18} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
      </div>
    );
  }

  // Not added yet state
  if (!userCert) {
    return (
      <button
        onClick={() => handleAction('interested')}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: small ? 12 : 14,
          fontWeight: 600,
          color: '#fff',
          background: 'var(--accent)',
          border: 'none',
          padding: small ? '6px 14px' : '12px 24px',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: small ? 32 : 44,
          boxShadow: '0 4px 12px var(--accent-glow)',
        }}
        className="hover:opacity-90 transform hover:-translate-y-0.5"
      >
        {loading ? (
          <Loader2 size={small ? 14 : 16} className="animate-spin" />
        ) : (
          <Plus size={small ? 14 : 16} />
        )}
        Add Certification
      </button>
    );
  }

  // Helper colors and labels for statuses
  const statusConfig = {
    interested: { label: 'Interested', color: 'var(--text-secondary)', bg: 'var(--border)' },
    'in-progress': { label: 'In Progress', color: 'var(--amber)', bg: 'var(--amber-dim)' },
    completed: { label: 'Completed', color: 'var(--green)', bg: 'var(--green-dim)' },
  };

  const current = statusConfig[userCert.status] || statusConfig.interested;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: small ? 12 : 14,
          fontWeight: 600,
          color: current.color,
          background: current.bg,
          border: `1px solid ${userCert.status === 'interested' ? 'var(--border-light)' : 'transparent'}`,
          padding: small ? '5px 12px' : '11px 22px',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: small ? 32 : 44,
        }}
        className="hover:opacity-90"
      >
        {loading ? (
          <Loader2 size={small ? 14 : 16} className="animate-spin" />
        ) : (
          <Check size={small ? 14 : 16} />
        )}
        <span>{current.label}</span>
        <ChevronDown size={small ? 12 : 14} style={{ opacity: 0.7 }} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 160,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '6px 0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            padding: '6px 12px 4px',
            letterSpacing: '0.05em',
          }}>
            Change Status
          </div>
          
          {(['interested', 'in-progress', 'completed'] as const).map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => handleAction(statusOption)}
              style={{
                background: 'none',
                border: 'none',
                color: userCert.status === statusOption ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '8px 12px',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: userCert.status === statusOption ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s',
              }}
              className="hover:bg-opacity-5 hover:bg-white"
            >
              {statusOption === 'interested' && 'Interested'}
              {statusOption === 'in-progress' && 'In Progress'}
              {statusOption === 'completed' && 'Completed'}
              {userCert.status === statusOption && <Check size={14} style={{ color: 'var(--accent)' }} />}
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          <button
            onClick={handleRemove}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--red)',
              padding: '8px 12px',
              textAlign: 'left',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            className="hover:bg-red-950 hover:bg-opacity-20"
          >
            <Trash2 size={14} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
