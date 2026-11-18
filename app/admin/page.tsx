'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Search, RefreshCw, Briefcase, User, Sparkles, ExternalLink, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface JobItem {
  id: number;
  title: string;
  company: string;
  description: string;
  skills: string[];
  createdAt: string;
  isGuest: boolean;
  user: {
    email?: string;
    name?: string;
  } | null;
}

interface AdminData {
  stats: {
    total: number;
    guest: number;
    registered: number;
    companies: number;
  };
  jobs: JobItem[];
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'guest' | 'registered'>('all');
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/jobs');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch admin data');
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchAdminData();
    }
  }, [isLoaded]);

  if (!isLoaded || (loading && !data)) {
    return (
      <div style={{ maxWidth: 1000, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading platform job scans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '40px 32px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
      }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          Admin Access Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {error}
        </p>
        <Link
          href="/sign-in?redirect_url=/admin"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: 'var(--accent, #2563eb)',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Sign In with Admin Account
        </Link>
      </div>
    );
  }

  const filteredJobs = (data?.jobs || []).filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      (j.user?.email && j.user.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'guest') return j.isGuest;
    if (filterType === 'registered') return !j.isGuest;
    return true;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 24,
      }}>
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent, #2563eb)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <ShieldCheck size={14} /> Admin Overview
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 8px',
          }}>
            Live Job Analyses Feed
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)' }}>
            Real-time activity log of all job descriptions analyzed across CertRoute.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Activity
        </button>
      </div>

      {/* Stats row */}
      {data?.stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
              Total Job Scans
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {data.stats.total}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
              Guest Searches
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '-0.5px' }}>
              {data.stats.guest}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
              Registered User Scans
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent, #2563eb)', letterSpacing: '-0.5px' }}>
              {data.stats.registered}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
              Unique Companies
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981', letterSpacing: '-0.5px' }}>
              {data.stats.companies}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 280, maxWidth: 460 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by job title, company, skill, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 4,
        }}>
          {(['all', 'registered', 'guest'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                border: 'none',
                background: filterType === type ? 'var(--accent, #2563eb)' : 'transparent',
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {type === 'all' ? `All (${data?.stats.total || 0})` : type}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            No analyzed jobs matched your filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredJobs.map((j) => {
            const isExpanded = expandedJobId === j.id;
            const formattedDate = new Date(j.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={j.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '20px 24px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {j.title}
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(0, 0, 0, 0.05)',
                        color: 'var(--text-secondary)',
                      }}>
                        {j.company}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: j.isGuest ? 'rgba(100, 116, 139, 0.1)' : 'var(--accent-dim, rgba(37, 99, 235, 0.1))',
                        color: j.isGuest ? 'var(--text-muted)' : 'var(--accent, #2563eb)',
                      }}>
                        {j.isGuest ? 'Guest' : `User: ${j.user?.email || j.user?.name || 'Registered'}`}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Scanned on {formattedDate} · Job #{j.id}
                    </div>

                    {/* Detected Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {j.skills.slice(0, 8).map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--border, #e2e8f0)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {j.skills.length > 8 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{j.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link
                      href={`/jobs/${j.id}`}
                      target="_blank"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        background: 'var(--accent, #2563eb)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      View Generated Roadmap <ExternalLink size={12} />
                    </Link>

                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : j.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide Details' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Full Job Description */}
                {isExpanded && (
                  <div style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border)',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 300,
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.02)',
                    padding: 14,
                    borderRadius: 8,
                  }}>
                    <strong style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>Full Job Description:</strong>
                    {j.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
