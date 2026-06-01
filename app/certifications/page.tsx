'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import CertificationRow from '@/components/CertificationRow';
import BrowseAllCertsModal from '@/components/BrowseAllCertsModal';

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

interface AvailableCert {
  id: number;
  name: string;
  provider: string;
  industry: string;
  difficulty: number;
  cost: string;
}

export default function MyCertificationsPage() {
  const { userId, isLoaded } = useAuth();
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'interested' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AvailableCert[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'interested' | 'in-progress' | 'completed'>('interested');
  const [searching, setSearching] = useState(false);
  const [showBrowseAll, setShowBrowseAll] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/user-certifications');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCertifications(data);
      } catch (error) {
        console.error('Error fetching certifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, [isLoaded, userId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/certifications/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching certifications:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCert = async (certId: number, certName: string) => {
    try {
      const response = await fetch('/api/user-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId,
          status: selectedStatus,
          startedDate: selectedStatus === 'in-progress' ? new Date().toISOString().split('T')[0] : null,
          completedDate: selectedStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
          notes: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add certification');

      // Refresh the list
      const refreshResponse = await fetch('/api/user-certifications');
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setCertifications(data);
      }

      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
    } catch (error) {
      console.error('Error adding certification:', error);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const cert = certifications.find(c => c.id === id);
    if (!cert) return;

    try {
      const response = await fetch('/api/user-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: cert.cert_id,
          status: newStatus,
          startedDate: newStatus === 'in-progress' ? new Date().toISOString().split('T')[0] : cert.started_date,
          completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : cert.completed_date,
          notes: cert.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setCertifications(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, status: newStatus as 'interested' | 'in-progress' | 'completed' }
            : c
        )
      );
    } catch (error) {
      console.error('Error updating certification:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/user-certifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setCertifications(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting certification:', error);
    }
  };

  // Reorder certifications: completed, in-progress, interested
  const orderedCerts = [...certifications].sort((a, b) => {
    const statusOrder = { 'completed': 0, 'in-progress': 1, 'interested': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const filteredCerts = filter === 'all' 
    ? orderedCerts 
    : orderedCerts.filter(c => c.status === filter);

  const stats = {
    interested: certifications.filter(c => c.status === 'interested').length,
    inProgress: certifications.filter(c => c.status === 'in-progress').length,
    completed: certifications.filter(c => c.status === 'completed').length,
  };

  if (!isLoaded || !userId) {
    return (
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your certifications.</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            fontFamily: 'var(--font-display)',
          }}>
            My Certifications
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            Track certifications you're interested in or working towards
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            + Add Certification
          </button>
          <button
            onClick={() => setShowBrowseAll(true)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid var(--accent)',
              background: 'transparent',
              color: 'var(--accent-light)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Browse All
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>
              Search & Add Certification
            </h3>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search certifications..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'interested' | 'in-progress' | 'completed')}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="interested">Interested</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {searching && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Searching...</div>
          )}

          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map(cert => {
                const alreadyAdded = certifications.some(c => c.cert_id === cert.id);
                return (
                  <div
                    key={cert.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'var(--bg)',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {cert.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {cert.provider} • {cert.industry} • Difficulty: {cert.difficulty}/5 • {cert.cost}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddCert(cert.id, cert.name)}
                      disabled={alreadyAdded}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: alreadyAdded ? 'var(--text-muted)' : 'var(--accent)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: alreadyAdded ? 'default' : 'pointer',
                        opacity: alreadyAdded ? 0.5 : 1,
                      }}
                    >
                      {alreadyAdded ? 'Added' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              No certifications found. Try a different search.
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--green)',
            marginBottom: 4,
          }}>
            {stats.completed}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Completed
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--amber)',
            marginBottom: 4,
          }}>
            {stats.inProgress}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            In Progress
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--accent)',
            marginBottom: 4,
          }}>
            {stats.interested}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Interested
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 16,
      }}>
        {(['all', 'completed', 'in-progress', 'interested'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: filter === tab ? 'var(--accent-dim)' : 'transparent',
              color: filter === tab ? 'var(--accent-light)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Certifications list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading your certifications...
        </div>
      ) : filteredCerts.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            {certifications.length === 0
              ? "You haven't added any certifications yet."
              : `No certifications in "${filter}" status.`}
          </p>
          <button
            onClick={() => setShowSearch(true)}
            style={{
              color: 'var(--accent-light)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Add your first certification →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredCerts.map(cert => (
            <CertificationRow
              key={cert.id}
              cert={cert}
              onUpdate={handleStatusUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Browse All Modal */}
      <BrowseAllCertsModal
        isOpen={showBrowseAll}
        onClose={() => setShowBrowseAll(false)}
        onAddCert={async (certId, certName) => {
          await handleAddCert(certId, certName);
        }}
        alreadyAddedCertIds={certifications.map(c => c.cert_id)}
      />
    </div>
  );
}
