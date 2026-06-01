'use client';

import { useEffect, useState } from 'react';

interface BrowseCert {
  id: number;
  name: string;
  provider: string;
  industry: string;
  difficulty: number;
  cost: string;
  duration_weeks: number;
  pass_rate_percent: number;
  salary_boost_low: number;
  salary_boost_high: number;
  trending: number;
  official_url?: string;
}

interface BrowseAllCertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCert: (certId: number, certName: string) => Promise<void>;
  alreadyAddedCertIds: number[];
}

const DIFFICULTY_LABELS = ['', 'Beginner', 'Beginner+', 'Intermediate', 'Advanced', 'Expert'];

export default function BrowseAllCertsModal({
  isOpen,
  onClose,
  onAddCert,
  alreadyAddedCertIds,
}: BrowseAllCertsModalProps) {
  const [certs, setCerts] = useState<BrowseCert[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const fetchCerts = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        search: searchQuery,
        industry: selectedIndustry,
        difficulty: selectedDifficulty,
        trending: trendingOnly.toString(),
        sortBy,
      });

      const response = await fetch(`/api/certifications/browse?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setCerts(data.certs);
      setIndustries(data.industries);
      setTotal(data.total);
      setPageSize(data.pageSize);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchCerts(1);
    }
  }, [isOpen, searchQuery, selectedIndustry, selectedDifficulty, trendingOnly, sortBy]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
            Browse All Certifications
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 24,
            }}
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search certifications (e.g., AWS, Data Science)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: 13,
              minWidth: '200px',
            }}
          />

          <select
            value={selectedIndustry}
            onChange={(e) => {
              setSelectedIndustry(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>
                {ind.charAt(0).toUpperCase() + ind.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <option value="all">All Levels</option>
            <option value="1">Beginner</option>
            <option value="2">Beginner+</option>
            <option value="3">Intermediate</option>
            <option value="4">Advanced</option>
            <option value="5">Expert</option>
          </select>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            <input
              type="checkbox"
              checked={trendingOnly}
              onChange={(e) => {
                setTrendingOnly(e.target.checked);
                setPage(1);
              }}
              style={{ cursor: 'pointer' }}
            />
            Trending Only
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: 13,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="difficulty">Sort by Difficulty</option>
            <option value="salary">Sort by Salary Boost</option>
            <option value="pass-rate">Sort by Pass Rate</option>
            <option value="trending">Sort by Trending</option>
          </select>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
              Loading certifications...
            </div>
          ) : certs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
              No certifications found matching your filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {certs.map(cert => {
                const isAdded = alreadyAddedCertIds.includes(cert.id);
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
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                      }}>
                        {cert.name}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}>
                        <span>{cert.provider}</span>
                        <span>•</span>
                        <span>{cert.industry}</span>
                        <span>•</span>
                        <span>{DIFFICULTY_LABELS[cert.difficulty]}</span>
                        <span>•</span>
                        <span>{cert.duration_weeks} weeks</span>
                        {cert.trending === 1 && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--green)' }}>🔥 Trending</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onAddCert(cert.id, cert.name)}
                      disabled={isAdded}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: isAdded ? 'var(--text-muted)' : 'var(--accent)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isAdded ? 'default' : 'pointer',
                        opacity: isAdded ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isAdded ? 'Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            alignItems: 'center',
          }}>
            <button
              onClick={() => fetchCerts(page - 1)}
              disabled={page === 1}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === 1 ? 'default' : 'pointer',
                fontSize: 12,
              }}
            >
              ← Prev
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 8px' }}>
              Page {page} of {totalPages}
            </div>

            <button
              onClick={() => fetchCerts(page + 1)}
              disabled={page === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === totalPages ? 'default' : 'pointer',
                fontSize: 12,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
