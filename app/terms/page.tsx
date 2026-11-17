'use client';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto 100px', padding: '0 24px', color: 'var(--text-primary)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, marginBottom: 24 }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
        Last updated: June 4, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Terms of Use</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          By accessing or using CertRoute, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. User Accounts</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          You are responsible for maintaining the confidentiality of your credentials and account information. You must notify us immediately of any unauthorized use of your account.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Limitation of Liability</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          CertRoute provides certification roadmaps and recommendations for informational purposes only. We make no guarantees regarding job placement, career advancement, or correctness of external certification costs/details.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Purchases, Digital Delivery & No-Refund Policy</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15, marginBottom: 12 }}>
          CertRoute offers digital access passes, including the Lifetime Career Pass ($9.99 USD one-time payment). Because access to digital intelligence, algorithmic job analyses, ATS resume match scorecards, and proprietary learning roadmaps is delivered immediately upon payment, <strong>all purchases are final, non-refundable, and non-exchangeable</strong>.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>
          By completing a purchase on CertRoute or through our payment processor (Stripe), you expressly acknowledge and agree that your access begins immediately and you waive any right of withdrawal or refund once digital delivery has occurred. If you experience any technical difficulty accessing your unlocked benefits, please contact support for immediate assistance.
        </p>
      </section>
    </div>
  );
}
