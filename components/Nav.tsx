'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function Nav() {
  const path = usePathname();
  const { isLoaded, userId } = useAuth();

  const links = [
    { href: '/', label: 'New Analysis' },
    { href: '/jobs', label: 'Saved Jobs' },
    { href: '/certifications', label: 'My Certifications' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(13,15,20,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 60,
        gap: 40,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}>C</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}>Certiva</span>
        </Link>

        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: path === link.href ? 'var(--accent-light)' : 'var(--text-secondary)',
              background: path === link.href ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 32 }}>
          {isLoaded && (
            userId ? (
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: 32,
                    height: 32,
                    border: '1px solid rgba(255,255,255,0.1)',
                  },
                  userPreviewMainIdentifier: {
                    color: '#fff',
                  },
                  userPreviewSecondaryIdentifier: {
                    color: '#fff',
                  },
                  userButtonBox: {
                    flexDirection: 'row-reverse',
                  },
                  menuButton__avatar: {
                    border: '1px solid rgba(255,255,255,0.1)',
                  },
                }
              }} />
            ) : (
              <>
                <Link href="/sign-in" style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
                >
                  Sign In
                </Link>
                <Link href="/sign-up" style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'var(--accent)',
                  padding: '6px 16px',
                  borderRadius: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'; }}
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
