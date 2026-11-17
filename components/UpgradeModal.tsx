'use client';

import React from 'react';
import { X, Sparkles, Check, ShieldCheck, Zap, Lock } from 'lucide-react';

const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/9B6eV69Tg85p3WAbiPdnW00';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title = "Unlock Unlimited Career Intelligence",
  subtitle = "You've reached the free limit. Upgrade to the Lifetime Career Pass for unlimited scans, full 3-step roadmaps, and the ATS resume match scorecard.",
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 20,
          maxWidth: 480,
          width: '100%',
          padding: '32px 28px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: 'var(--text-primary, #0f172a)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* Pro Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--accent-dim, rgba(37, 99, 235, 0.08))',
          border: '1px solid var(--accent, #2563eb)',
          borderRadius: 100,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--accent, #2563eb)',
          marginBottom: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <Sparkles size={14} />
          Lifetime Career Pass
        </div>

        {/* Header */}
        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary, #475569)',
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>

        {/* Perks Checklist */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 14,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              background: '#10b981',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <strong style={{ fontSize: 13, display: 'block' }}>Unlimited Job Description Scans</strong>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Analyze as many jobs as you want with zero search limits.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              background: '#10b981',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <strong style={{ fontSize: 13, display: 'block' }}>Complete 3-Step Roadmaps (Step 3 Unlocked)</strong>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Access high-salary specialist certs and senior career pathways.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              background: '#10b981',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <strong style={{ fontSize: 13, display: 'block' }}>Resume & ATS Match Scorecard</strong>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pinpoint missing skills and see exact certs that beat recruiter filters.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              background: '#10b981',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <strong style={{ fontSize: 13, display: 'block' }}>Lifetime Access · Zero Subscriptions</strong>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pay once, own it forever. Includes all future certification updates.</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={STRIPE_PAYMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 20px',
            background: 'var(--accent, #2563eb)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'opacity 0.2s ease',
          }}
        >
          <Zap size={18} fill="#fff" />
          Unlock Lifetime Career Pass — $9.99
        </a>

        {/* Guarantee text */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 14,
          fontSize: 11,
          color: 'var(--text-muted, #64748b)',
        }}>
          <ShieldCheck size={14} />
          <span>One-time payment · Instant digital unlock · Secured by Stripe</span>
        </div>
      </div>
    </div>
  );
}

