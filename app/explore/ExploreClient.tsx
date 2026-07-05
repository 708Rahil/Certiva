'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Briefcase, Award, ArrowRight } from 'lucide-react';

interface Role {
  name: string;
  slug: string;
  industry: string;
  certCount: number;
  certNames: string[];
}

const INDUSTRY_LABELS: Record<string, string> = {
  cloud: 'Cloud & Infrastructure',
  cybersecurity: 'Cybersecurity',
  data: 'Data Science & Analytics',
  ai_ml: 'AI & Machine Learning',
  finance: 'Finance & Accounts',
  marketing: 'Growth & Marketing',
  management: 'Management & Operations',
  business: 'Business & CRM',
  networking: 'Networking & Hardware',
  general: 'General & Others',
};

const INDUSTRY_ICONS: Record<string, string> = {
  cloud: '☁️',
  cybersecurity: '🛡️',
  data: '📊',
  ai_ml: '🤖',
  finance: '💰',
  marketing: '📈',
  management: '👔',
  business: '💼',
  networking: '🔌',
  general: '⚙️',
};

export default function ExploreClient({ initialRoles }: { initialRoles: Role[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const industries = useMemo(() => {
    const active = new Set(initialRoles.map(r => r.industry));
    return ['all', ...Array.from(active)];
  }, [initialRoles]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleIndustryChange = (val: string) => {
    setSelectedIndustry(val);
    setCurrentPage(1);
  };

  const filteredRoles = useMemo(() => {
    const filtered = initialRoles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.certNames.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesIndustry = selectedIndustry === 'all' || role.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });

    if (!searchQuery) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const query = searchQuery.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Exact match on role name
      if (aName === query && bName !== query) return -1;
      if (bName === query && aName !== query) return 1;

      // Starts with the search query
      const aStartsWith = aName.startsWith(query);
      const bStartsWith = bName.startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (bStartsWith && !aStartsWith) return 1;

      // Role name contains the query
      const aContains = aName.includes(query);
      const bContains = bName.includes(query);
      if (aContains && !bContains) return -1;
      if (bContains && !aContains) return 1;

      // Fallback to cert count
      return b.certCount - a.certCount;
    });
  }, [initialRoles, searchQuery, selectedIndustry]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedRoles = useMemo(() => {
    return filteredRoles.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);
  }, [filteredRoles, safeCurrentPage, itemsPerPage]);

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '40px 24px 80px',
    }}>
      {/* Hero Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 48,
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          marginBottom: 16,
        }}>
          Job Guides & Certification Paths
        </h1>
        <p style={{
          fontSize: 16,
          color: 'var(--text-secondary)',
          maxWidth: 600,
          margin: '0 auto 32px',
          lineHeight: 1.6,
        }}>
          Select your target career path to discover top-rated certifications, custom sequenced roadmaps, exam costs, and salary boosts.
        </p>

        {/* Search Input */}
        <div style={{
          maxWidth: 540,
          margin: '0 auto',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search roles (e.g. Software Engineer, Cloud Architect)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: 15,
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Industry Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 12,
        marginBottom: 36,
        borderBottom: '1px solid var(--border)',
      }}>
        {industries.map(ind => (
          <button
            key={ind}
            onClick={() => handleIndustryChange(ind)}
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              border: selectedIndustry === ind ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: selectedIndustry === ind ? 'var(--accent-dim)' : 'transparent',
              color: selectedIndustry === ind ? 'var(--accent-light)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {ind === 'all' ? '✨ All Careers' : `${INDUSTRY_ICONS[ind] || '⚙️'} ${INDUSTRY_LABELS[ind] || ind}`}
          </button>
        ))}
      </div>

      {/* Role Cards Grid */}
      {filteredRoles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}>
          <Briefcase size={40} style={{ color: 'var(--text-secondary)', marginBottom: 12, opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            No Career Paths Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Try adjusting your search terms or selecting a different industry.
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {paginatedRoles.map(role => (
              <Link
                key={role.slug}
                href={`/certifications/role/${role.slug}`}
                style={{
                  textDecoration: 'none',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                }}
                className="explore-role-card"
              >
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontSize: 24,
                      padding: '8px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      display: 'inline-flex',
                    }}>
                      {INDUSTRY_ICONS[role.industry] || '⚙️'}
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--accent-light)',
                      background: 'var(--accent-dim)',
                      padding: '4px 10px',
                      borderRadius: 100,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Award size={12} />
                      {role.certCount} {role.certCount === 1 ? 'Cert' : 'Certs'}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                  }}>{role.name}</h3>

                  <span style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: 16,
                  }}>
                    {INDUSTRY_LABELS[role.industry] || role.industry}
                  </span>

                  {role.certNames.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      borderTop: '1px solid rgba(255,255,255,0.03)',
                      paddingTop: 16,
                      marginBottom: 20,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Key Certifications
                      </span>
                      {role.certNames.map((name, idx) => (
                        <div key={idx} style={{
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          • {name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: 'auto',
                }}>
                  View Career Path <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 48,
              flexWrap: 'wrap',
            }}>
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: safeCurrentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: safeCurrentPage === 1 ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                Previous
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: safeCurrentPage === pageNum ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: safeCurrentPage === pageNum ? 'var(--accent)' : 'transparent',
                    color: safeCurrentPage === pageNum ? '#ffffff' : 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: safeCurrentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: safeCurrentPage === totalPages ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
