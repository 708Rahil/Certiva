'use client';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto 100px', padding: '0 24px', color: 'var(--text-primary)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, marginBottom: 24 }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
        Last updated: June 4, 2026
      </p>
      
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Information We Collect</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          We collect information you provide directly to us when creating an account, saving job postings, updating your career profile, or contacting us. This includes your name, email, target job roles, skills, and any job descriptions you submit for analysis.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. How We Use Your Information</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          We use the information we collect to personalize your career roadmap recommendations, analyze skills gaps, maintain your user profile, and communicate product updates. We do not sell your personal data to third parties.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Security</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          We implement industry-standard security measures, powered by Clerk for authentication and Supabase for secure database transactions, to protect your personal details from unauthorized access.
        </p>
      </section>
    </div>
  );
}
