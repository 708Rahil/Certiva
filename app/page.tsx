import Link from 'next/link';
import { ShieldCheck, Compass, Sparkles, MapPin, BadgeDollarSign, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent-dim)',
          border: '1px solid var(--border)',
          borderRadius: 100,
          padding: '6px 16px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--accent-light)',
          marginBottom: 24,
        }}>
          ✨ Version 1.0 — Free Career Intelligence Tool
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: 20,
          color: 'var(--text-primary)',
        }}>
          Stop Guessing Your Next <br />
          <span style={{ color: 'var(--accent-light)' }}>Tech Certification.</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          maxWidth: 640,
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Paste any job posting. Instantly build a customized certification roadmap, calculate estimated salary boosts, and track your learning milestones.
        </p>

        {/* Hero CTAs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 60,
        }}>
          <Link
            href="/analyze"
            style={{
              padding: '14px 28px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Analyze a Job Description ➔
          </Link>
          <Link
            href="/explore"
            style={{
              padding: '14px 28px',
              borderRadius: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            Explore Career Guides
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 40,
          color: 'var(--text-primary)',
        }}>
          Built to Solve the Tech Credential Mess
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 80,
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ color: 'var(--accent-light)', marginBottom: 16 }}><Sparkles size={24} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Job Compatibility Check</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Pasted job listings are parsed using keyword-extraction models to match exact employer skills with certified curricula.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ color: 'var(--accent-light)', marginBottom: 16 }}><BadgeDollarSign size={24} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Salary ROI Estimation</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Compare real exam registration fees with estimated low/high salary boost data to maximize your financial return.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ color: 'var(--accent-light)', marginBottom: 16 }}><Compass size={24} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Alternative Pathways</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Avoid vendor lock-in. Switch main timeline steps dynamically with alternative certs across AWS, Azure, and Google Cloud.
            </p>
          </div>
        </div>

        {/* Login/Signup CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79,110,247,0.05), transparent)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'inline-flex', color: 'var(--accent-light)', marginBottom: 16 }}><Lock size={28} /></div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
            Save Your Roadmaps & Track Progress
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            maxWidth: 500,
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}>
            Create a free account to track completed credentials, monitor your personal skill gap progress, and save custom roadmap histories.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <Link
              href="/sign-up"
              style={{
                padding: '12px 28px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              Sign Up for Free
            </Link>
            <Link
              href="/sign-in"
              style={{
                padding: '12px 28px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
