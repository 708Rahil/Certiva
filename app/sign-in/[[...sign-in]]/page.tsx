import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 60px)',
      background: 'radial-gradient(circle at 50% 50%, rgba(79, 110, 247, 0.08) 0%, rgba(10, 11, 15, 0) 70%)',
      padding: '40px 24px',
    }}>
      <div style={{
        animation: 'fade-up 0.5s ease-out',
      }}>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#4f6ef7',
              colorBackground: '#131514',
              colorInputBackground: '#1d202b',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
              colorTextSecondary: '#cbd5e1',
              colorBorder: 'rgba(255, 255, 255, 0.12)',
            },
            elements: {
              card: {
                background: 'rgba(19, 21, 28, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                borderRadius: '20px',
              },
              headerTitle: {
                color: '#ffffff',
              },
              headerSubtitle: {
                color: '#cbd5e1',
              },
              dividerText: {
                color: '#94a3b8',
              },
              dividerLine: {
                background: 'rgba(255, 255, 255, 0.12)',
              },
              formFieldLabel: {
                color: '#e2e8f0',
                fontWeight: 500,
              },
              formFieldInput: {
                background: '#1d202b',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '&:focus': {
                  borderColor: '#4f6ef7',
                }
              },
              formFieldLabelRow: {
                marginBottom: '6px',
              },
              socialButtonsBlockButton: {
                background: '#1a1d26',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                '&:hover': {
                  background: '#232733',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }
              },
              socialButtonsBlockButtonText: {
                color: '#ffffff',
                fontWeight: 500,
              },
              formButtonPrimary: {
                background: '#4f6ef7',
                '&:hover': {
                  background: '#6b83f9',
                }
              },
              footerActionLink: {
                color: '#6b83f9',
                '&:hover': {
                  color: '#8b9ffa',
                }
              },
              footerActionText: {
                color: '#94a3b8',
              }
            }
          }}
        />
      </div>
    </div>
  );
}
