import Link from 'next/link';
import { Sparkles, BadgeDollarSign, Compass, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

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
          color: 'var(--accent)',
          marginBottom: 24,
        }}>
          ✨ Free Job Description Analysis & Career Roadmap Tool
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
          <span style={{ color: 'var(--accent)' }}>Tech Certification.</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          maxWidth: 640,
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Paste any job description. Instantly build a customized certification roadmap, calculate estimated salary boosts, and track your learning milestones.
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

      {/* Visual Live Demos Section (Jobscan-style) */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            Explore the Platform Features
          </h2>
          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto 60px',
          }}>
            See how CertRoute matches certifications and structures paths to accelerate your career growth.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: 32,
          }}>
            {/* Demo 1: The Cert Matcher */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Interactive Demo
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0' }}>Job Compatibility Engine</h3>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: 20,
                }}>
                  94% Match Fit
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20, background: '#fafafa' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Pasted Posting:</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Cloud Infrastructure Architect — Stripe</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Required: AWS VPC, EC2, IAM, Kubernetes, CloudFormation, high-availability architecture...
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Best Matched Credentials:</div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: '#fff' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>AWS Certified Solutions Architect</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Difficulty: 3/5 · Cost: $150</div>
                  </div>
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle2 size={14} /> +$15,000 Boost
                  </span>
                </div>
              </div>
            </div>

            {/* Demo 2: The Sequenced Role Roadmap */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Structured Paths
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0' }}>Dynamic Career Roadmaps</h3>
              </div>

              {/* Vertical Step progression preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', paddingLeft: 24 }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--accent-dim)' }} />

                {/* Step 1 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -24, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Step 1: Foundational</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>AWS Certified Cloud Practitioner</div>
                </div>

                {/* Step 2 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -24, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Step 2: Associate</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>AWS Certified Developer (SAA-C03)</div>
                </div>

                {/* Step 3 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -24, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Step 3: Professional</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>AWS Certified Solutions Architect Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '80px 24px',
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 40,
          color: 'var(--text-primary)',
        }}>
          Everything You Need to Level Up
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
            <div style={{ color: 'var(--accent)', marginBottom: 16 }}><Sparkles size={24} /></div>
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
            <div style={{ color: 'var(--accent)', marginBottom: 16 }}><BadgeDollarSign size={24} /></div>
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
            <div style={{ color: 'var(--accent)', marginBottom: 16 }}><Compass size={24} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Alternative Pathways</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Avoid vendor lock-in. Switch main timeline steps dynamically with alternative certs across AWS, Azure, and Google Cloud.
            </p>
          </div>
        </div>

        {/* Login/Signup CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79,110,247,0.04), transparent)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '48px 32px',
          textAlign: 'center',
        }}>
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
                background: 'rgba(0,0,0,0.02)',
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
