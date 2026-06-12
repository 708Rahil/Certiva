'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function Nav() {
  const path = usePathname();
  const { isLoaded, userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Desktop & Main Header bar */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        width: '100%',
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

        {/* Desktop Links (Hidden on mobile via desktop-menu class in globals.css) */}
        <div className="desktop-menu" style={{ display: 'flex', gap: 4, flex: 1, marginLeft: 40 }}>
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

        {/* Desktop Authenticated / Auth Actions (Hidden on mobile via nav-desktop-actions class) */}
        <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 32 }}>
          {isLoaded && (
            userId ? (
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: { width: 32, height: 32, border: '1px solid rgba(255,255,255,0.1)' },
                  userPreviewMainIdentifier: { color: '#fff' },
                  userPreviewSecondaryIdentifier: { color: '#fff' },
                  userButtonBox: { flexDirection: 'row-reverse' },
                  menuButton__avatar: { border: '1px solid rgba(255,255,255,0.1)' },
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
                }}>
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
                }}>
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Hamburger Button (Visible on mobile via media query classes) */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            // Close 'X' SVG icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            // Hamburger SVG icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            style={{
              textDecoration: 'none',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              color: path === link.href ? 'var(--accent-light)' : 'var(--text-secondary)',
              background: path === link.href ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.15s',
              display: 'block',
            }}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

        {/* Mobile Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px' }}>
          {isLoaded && (
            userId ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Account Settings</span>
                <UserButton appearance={{
                  elements: {
                    userButtonAvatarBox: { width: 32, height: 32, border: '1px solid rgba(255,255,255,0.1)' },
                  }
                }} />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  style={{
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 0',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsOpen(false)}
                  style={{
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'var(--accent)',
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 0',
                    borderRadius: 8,
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
