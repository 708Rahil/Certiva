'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg)',
      padding: '40px 24px 48px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Top section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}>
          {/* Logo brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src="/logo.png" 
              alt="CertRoute Logo" 
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                objectFit: 'cover'
              }} 
            />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>CertRoute</span>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Home
            </Link>
            <Link href="/explore" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Explore
            </Link>
            <Link href="/certifications" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Certifications
            </Link>
            <Link href="/roadmap" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              My Roadmap
            </Link>
            <Link href="/jobs" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Saved Jobs
            </Link>
            <Link href="/analyze" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Analyze
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Bottom section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © {currentYear} CertRoute. All rights reserved.
          </span>

          {/* Legal Links */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
