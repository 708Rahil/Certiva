'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EXAMPLE_JOBS = [
  {
    title: 'Cloud Infrastructure Engineer',
    company: 'Stripe',
    description: 'We are looking for a Cloud Infrastructure Engineer to design, implement, and manage our AWS-based cloud infrastructure. You will work with VPC, IAM, EC2, and S3 to ensure scalability and high availability. Strong networking knowledge (TCP/IP, DNS, routing) and security best practices are required. Experience with Kubernetes, Docker, and CI/CD pipelines is a plus.',
  },
  {
    title: 'Data Analyst',
    company: 'Shopify',
    description: 'Join our data team as a Data Analyst. You will write complex SQL queries, build dashboards in Tableau, and perform statistical analysis using Python (pandas, NumPy). You should be comfortable with data cleaning, data visualization, and presenting insights to stakeholders. Experience with Google Analytics and Excel is a bonus.',
  },
  {
    title: 'Cybersecurity Analyst',
    company: 'Deloitte',
    description: 'We are hiring a Cybersecurity Analyst to monitor and respond to security threats. Responsibilities include vulnerability assessment, incident response, network security monitoring using SIEM tools, and risk management. You should understand cryptography, firewalls, and compliance frameworks. Penetration testing experience is a plus.',
  },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async () => {
    if (!title.trim() || !company.trim() || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, description }),
      });
      const data = await res.json();
      if (data.jobId) {
        router.push(`/jobs/${data.jobId}`);
      } else {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const fillExample = (ex: typeof EXAMPLE_JOBS[0]) => {
    setTitle(ex.title);
    setCompany(ex.company);
    setDescription(ex.description);
    setCharCount(ex.description.length);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px' }}>
      {/* Hero */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-dim)',
          border: '1px solid rgba(79,110,247,0.3)',
          borderRadius: 100, padding: '5px 14px',
          fontSize: 12, fontWeight: 600, color: 'var(--accent-light)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-light)', display: 'inline-block' }} />
          Career Intelligence Platform
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 6vw, 52px)',
          fontWeight: 400,
          margin: '0 0 16px',
          letterSpacing: '-1px',
          lineHeight: 1.15,
          color: 'var(--text-primary)',
        }}>
          Know exactly which<br />
          <span style={{ color: 'var(--accent-light)', fontStyle: 'italic' }}>certifications</span> you need for any job
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', margin: 0, maxWidth: 500, marginInline: 'auto', lineHeight: 1.6 }}>
          Paste any job posting. Get a ranked list of certifications matched to what that employer actually needs.
        </p>
      </div>

      {/* Example chips */}
      <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>Try an example:</span>
        {EXAMPLE_JOBS.map((ex) => (
          <button
            key={ex.title}
            onClick={() => fillExample(ex)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 100,
              padding: '5px 14px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-light)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="animate-fade-up delay-2" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '32px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Job Title
            </label>
            <input
              style={inputStyle}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Cloud Engineer"
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Company
            </label>
            <input
              style={inputStyle}
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Job Description
            </label>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{charCount} chars</span>
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 180, resize: 'vertical', lineHeight: 1.6 }}
            value={description}
            onChange={e => { setDescription(e.target.value); setCharCount(e.target.value.length); }}
            placeholder="Paste the full job description here — the more detail, the better the match..."
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {error && (
          <div style={{
            background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: 'var(--red)',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'var(--border)' : 'var(--accent)',
            border: 'none',
            borderRadius: 12,
            padding: '14px',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '-0.1px',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-light)'; }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Spinner /> Analyzing job description...
            </span>
          ) : (
            '→ Analyze & Get Certifications'
          )}
        </button>
      </div>

      {/* How it works */}
      <div className="animate-fade-up delay-3" style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { step: '01', label: 'Extract Skills', desc: 'We parse your job posting and identify every required skill and technology.' },
          { step: '02', label: 'Match & Score', desc: 'Each certification is scored 0–100 based on skill overlap, domain fit, and level.' },
          { step: '03', label: 'Ranked Results', desc: 'You get a prioritized list with explanations — not generic advice, real signal.' },
        ].map(({ step, label, desc }) => (
          <div key={step} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '20px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>{step}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
