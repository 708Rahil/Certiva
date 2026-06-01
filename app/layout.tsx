import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Certiva — Career Intelligence Platform",
  description: "Get the most relevant certifications for any job posting",
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
            title: 'Sign into Certiva',
            subtitle: 'Welcome back! Please sign in to continue.',
          },
        },
        signUp: {
          start: {
            title: 'Create your Certiva account',
            subtitle: 'Welcome! Please fill in the details to get started.',
          },
        },
      }}
      appearance={{
      variables: {
        colorPrimary: '#4f6ef7',
        colorBackground: '#131514',
        colorInputBackground: '#1d202b',
        colorInputText: '#ffffff',
        colorText: '#ffffff',
        colorTextSecondary: '#ffffff',
        colorBorder: 'rgba(255, 255, 255, 0.12)',
      },
      elements: {
        userButtonPopoverTextSecondary: {
          color: '#ffffff',
        },
        activeDeviceSubtitle: {
          color: '#ffffff',
        },
        sessionItemSubtitle: {
          color: '#ffffff',
        }
      }
    }}>
      <html lang="en">
        <body>
          <Nav />
          <main style={{ minHeight: "calc(100vh - 60px)" }}>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
