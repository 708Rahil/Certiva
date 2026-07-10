import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL('https://certroute.co'),
  title: "CertRoute — Career Intelligence Platform",
  description: "Paste any job listing to instantly map the exact certifications you need to stand out to recruiters, pass resume filters, and get hired. Compare costs and salary boosts in seconds.",
  icons: {
    icon: "/icon-192.png?v=2",
    shortcut: "/icon-192.png?v=2",
    apple: "/icon-192.png?v=2",
  },
  openGraph: {
    title: "CertRoute — Career Intelligence Platform",
    description: "Paste any job listing to instantly map the exact certifications you need to stand out to recruiters, pass resume filters, and get hired. Compare costs and salary boosts in seconds.",
    url: "https://certroute.co",
    siteName: "CertRoute",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "CertRoute OG Preview Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CertRoute — Career Intelligence Platform",
    description: "Paste any job listing to instantly map the exact certifications you need to stand out to recruiters, pass resume filters, and get hired. Compare costs and salary boosts in seconds.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: 'Sign into CertRoute',
            subtitle: 'Welcome back! Please sign in to continue.',
          },
        },
        signUp: {
          start: {
            title: 'Create your CertRoute account',
            subtitle: 'Welcome! Please fill in the details to get started.',
          },
        },
      }}
      appearance={{
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorInputBackground: '#f8fafc',
        colorInputText: '#0f172a',
        colorText: '#0f172a',
        colorTextSecondary: '#475569',
        colorBorder: '#e2e8f0',
      },
      elements: {
        userButtonPopoverTextSecondary: {
          color: '#475569',
        },
        activeDeviceSubtitle: {
          color: '#475569',
        },
        sessionItemSubtitle: {
          color: '#475569',
        }
      }
    }}>
      <html lang="en">
        <head>
          {/* Google Analytics (gtag.js) */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-1E2482W3WJ"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1E2482W3WJ');
            `}
          </Script>
        </head>
        <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Nav />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
