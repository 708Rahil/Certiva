import Link from 'next/link';

interface LoggedOutStateProps {
  title: string;
  description: string;
  features: string[];
}

export default function LoggedOutState({ title, description, features }: LoggedOutStateProps) {
  return (
    <div style={{
      maxWidth: 600,
      margin: '80px auto',
      padding: '40px 32px',
      background: 'rgba(19, 21, 28, 0.7)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border)',
      borderRadius: 24,
      textAlign: 'center',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      animation: 'fade-up 0.5s ease-out',
    }}>
      {/* Icon */}
      <div style={{
        width: 64,
        height: 64,
        background: 'var(--accent-dim)',
        border: '1px solid rgba(79, 110, 247, 0.3)',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        margin: '0 auto 24px',
        animation: 'pulse 2s infinite',
      }}>
        🔒
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 400,
        color: 'var(--text-primary)',
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
      }}>
        {title}
      </h2>
      
      <p style={{
        fontSize: 15,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        margin: '0 0 28px',
      }}>
        {description}
      </p>

      {/* Feature list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'flex-start',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 32,
        border: '1px solid rgba(255, 255, 255, 0.03)',
      }}>
        {features.map((feature, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-light)', fontWeight: 'bold' }}>✓</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/sign-up" style={{
          background: 'var(--accent)',
          color: '#fff',
          textDecoration: 'none',
          padding: '14px 28px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          transition: 'all 0.2s',
          display: 'block',
          textAlign: 'center',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-light)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'; }}
        >
          Create Free Account
        </Link>
        <Link href="/sign-in" style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          textDecoration: 'none',
          padding: '14px 28px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          transition: 'all 0.2s',
          display: 'block',
          textAlign: 'center',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--text-secondary)';
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.02)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
        }}
        >
          Sign In to Existing Account
        </Link>
      </div>
    </div>
  );
}
