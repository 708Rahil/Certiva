import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 60px)',
      background: 'radial-gradient(circle at 50% 50%, rgba(79, 110, 247, 0.05) 0%, var(--bg) 70%)',
      padding: '40px 24px',
    }}>
      <div style={{
        animation: 'fade-up 0.5s ease-out',
      }}>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#4f6ef7',
              colorBackground: '#ffffff',
              colorInputBackground: '#f8fafc',
              colorInputText: '#0f172a',
              colorText: '#0f172a',
              colorTextSecondary: '#475569',
              colorBorder: '#e2e8f0',
            },
            elements: {
              card: {
                background: '#ffffff',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
                borderRadius: '20px',
              },
              headerTitle: {
                color: '#0f172a',
              },
              headerSubtitle: {
                color: '#475569',
              },
              dividerText: {
                color: '#64748b',
              },
              dividerLine: {
                background: '#e2e8f0',
              },
              formFieldLabel: {
                color: '#475569',
                fontWeight: 500,
              },
              formFieldInput: {
                background: '#f8fafc',
                color: '#0f172a',
                border: '1px solid var(--border)',
                '&:focus': {
                  borderColor: '#4f6ef7',
                }
              },
              formFieldLabelRow: {
                marginBottom: '6px',
              },
              socialButtonsBlockButton: {
                background: '#ffffff',
                border: '1px solid var(--border)',
                color: '#0f172a',
                '&:hover': {
                  background: '#f8fafc',
                  borderColor: 'var(--border)',
                }
              },
              socialButtonsBlockButtonText: {
                color: '#0f172a',
                fontWeight: 500,
              },
              formButtonPrimary: {
                background: '#4f6ef7',
                '&:hover': {
                  background: '#6b83f9',
                }
              },
              footerActionLink: {
                color: 'var(--accent)',
                '&:hover': {
                  color: 'var(--accent-light)',
                }
              },
              footerActionText: {
                color: '#64748b',
              }
            }
          }}
        />
      </div>
    </div>
  );
}
