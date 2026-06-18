import Link from 'next/link';
import { Sparkles, BadgeDollarSign, Compass, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Star, ExternalLink, Plus } from 'lucide-react';

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Hero Section Container */}
      <div style={{
        maxWidth: 1140,
        margin: '0 auto',
        padding: '80px 24px 80px',
      }}>
        {/* Two-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
          alignItems: 'center',
        }}>
          
          {/* Left Column: Hero Text & Actions */}
          <div style={{ textAlign: 'left' }}>
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
              fontSize: 'clamp(38px, 5vw, 54px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}>
              Stop Guessing Your <br />
              <span style={{ color: 'var(--accent)' }}>Next Certification.</span>
            </h1>

            <p style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              maxWidth: 580,
              marginBottom: 36,
              lineHeight: 1.6,
            }}>
              Paste any job description. Instantly build a customized certification roadmap, calculate estimated salary boosts, and track your learning milestones.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
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

          {/* Right Column: Visual Dashboard Mockups (Side-by-Side/Stacked UI Shot) */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: '100%',
          }}>
            
            {/* Mockup A: Recommended Certification Match Card (High Fidelity) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              zIndex: 2,
            }}>
              {/* Score Circular Ring */}
              <div style={{
                position: 'absolute',
                right: 20,
                top: 20,
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: '3px solid #10b981',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>94</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#64748b', marginTop: 1 }}>SCORE</span>
              </div>

              {/* Title Header */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10, paddingRight: 55 }}>
                <span style={{
                  background: 'rgba(79, 110, 247, 0.08)',
                  color: 'var(--accent)',
                  fontSize: 12,
                  fontWeight: 700,
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  #1
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      AWS Developer Associate
                    </h4>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--accent)',
                      background: 'var(--accent-dim)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      CLOUD
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Amazon Web Services</span>
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#475569', margin: '0 0 12px', lineHeight: 1.4 }}>
                Validates proficiency in developing and maintaining AWS-based applications.
              </p>

              {/* Skill Match Highlight Info Box */}
              <div style={{
                background: 'rgba(79, 110, 247, 0.03)',
                border: '1px solid rgba(79, 110, 247, 0.08)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 12,
                fontSize: 11,
                color: '#334155',
                lineHeight: 1.4,
              }}>
                Covers <strong>80% of skills</strong>. Matches: serverless, Node.js, S3, Lambda.
              </div>

              {/* Skill Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {['serverless', 'Node.js', 'S3', 'Lambda'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}>
                    ✓ {tag}
                  </span>
                ))}
              </div>

              {/* Metadata & Actions Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #f1f5f9',
                paddingTop: 12,
                fontSize: 11,
              }}>
                <div style={{ display: 'flex', gap: 12, color: '#64748b' }}>
                  <div>Cost: <strong style={{ color: '#0f172a' }}>$150</strong></div>
                  <div>Weeks: <strong style={{ color: '#0f172a' }}>8</strong></div>
                </div>
                <div style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: 6,
                }}>
                  View Details
                </div>
              </div>
            </div>

            {/* Mockup B: Career Timeline Roadmap step (High Fidelity) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              zIndex: 1,
            }}>
              {/* Vertical timeline progress preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', paddingLeft: 20 }}>
                <div style={{
                  position: 'absolute',
                  left: 5,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: 'linear-gradient(to bottom, var(--accent) 70%, #e2e8f0)',
                }} />

                {/* Step 1 */}
                <div style={{ position: 'relative' }}>
                  {/* Timeline circle node */}
                  <div style={{
                    position: 'absolute',
                    left: -20,
                    top: 2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '3px solid #fff',
                  }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Step 1: Foundational Credentials</div>
                  
                  {/* Step Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>AWS Certified AI Practitioner</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Amazon Web Services · Lvl 1/5</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '4px 8px', borderRadius: 6 }}>
                      + Add
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: -20,
                    top: 2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#cbd5e1',
                    border: '3px solid #fff',
                  }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Step 2: Associate Certifications</div>
                  
                  {/* Step Card for Step 2 */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: 0.85,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>AWS Certified Developer - Associate</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Amazon Web Services · Lvl 3/5</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '4px 8px', borderRadius: 6 }}>
                      + Add
                    </span>
                  </div>
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
        padding: '40px 24px 80px',
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
