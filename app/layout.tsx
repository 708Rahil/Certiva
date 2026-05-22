import type { Metadata } from "next";
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
    <html lang="en">
      <body>
        <Nav />
        <main style={{ minHeight: "calc(100vh - 60px)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
