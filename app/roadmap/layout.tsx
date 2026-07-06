import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Custom Certification Roadmap | CertRoute',
  description: 'Track your personal certification roadmap and discover what certifications you need for your saved job listings.',
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
